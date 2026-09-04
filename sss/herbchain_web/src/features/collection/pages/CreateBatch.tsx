import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '../../../components/PageHeader';
import DocumentUpload from '../../../components/DocumentUpload';
import OfflineSyncStatus from '../../../components/OfflineSyncStatus';
import { toast } from 'sonner';
import { MapPin, Sparkles, CheckCircle, Package, Loader2, Lock, UserCheck, AlertCircle, Navigation, ShieldCheck, ShieldAlert, CalendarClock } from 'lucide-react';
import { useBatchStore } from '../../../store/useBatchStore';
import { useAuthStore } from '../../../store/authStore';
import { useActiveMembers } from '../useActiveMembers';
import { supabase } from '../../../lib/supabase';
import type { Batch, UserRole } from '../../../types';

/** A species' approved harvesting belt and season (public.species_rules) —
 *  fetched so the collector's real-time GPS reading can be checked against it
 *  client-side, the same rule the database trigger enforces server-side. */
interface ZoneRule {
  species: string;
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
  harvest_month_start: number;
  harvest_month_end: number;
  zone_label: string | null;
}

function parseGps(gps: string): [number, number] | null {
  const parts = gps.split(',').map((p) => Number(p.trim()));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return [parts[0], parts[1]];
}

/** Mirrors the wrap-around-aware window check in add_species_collection_rules.sql. */
function monthInSeason(month: number, start: number, end: number): boolean {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

const HERB_MASTER_DB: Record<string, string> = {
  'Ashwagandha': 'Withania somnifera',
  'Tulsi (Holy Basil)': 'Ocimum tenuiflorum',
  'Neem': 'Azadirachta indica',
  'Aloe Vera': 'Aloe barbadensis Miller',
  'Turmeric': 'Curcuma longa',
  'Ginger': 'Zingiber officinale',
  'Amla (Indian Gooseberry)': 'Phyllanthus emblica',
  'Brahmi': 'Bacopa monnieri',
  'Giloy (Guduchi)': 'Tinospora cordifolia',
  'Shatavari': 'Asparagus racemosus',
  'Haritaki': 'Terminalia chebula',
  'Bibhitaki': 'Terminalia bellirica',
  'Bael': 'Aegle marmelos',
  'Arjuna': 'Terminalia arjuna',
  'Mulethi (Licorice)': 'Glycyrrhiza glabra',
  'Kalmegh': 'Andrographis paniculata',
  'Bhringraj': 'Eclipta prostrata',
  'Gudmar': 'Gymnema sylvestre',
  'Guggul': 'Commiphora wightii',
  'Punarnava': 'Boerhavia diffusa',
  'Vasaka': 'Justicia adhatoda',
  'Sarpagandha': 'Rauvolfia serpentina',
  'Manjistha': 'Rubia cordifolia',
  'Vidanga': 'Embelia ribes',
  'Safed Musli': 'Chlorophytum borivilianum',
  'Moringa (Drumstick)': 'Moringa oleifera',
  'Pippali (Long Pepper)': 'Piper longum',
  'Black Pepper': 'Piper nigrum',
  'Cardamom': 'Elettaria cardamomum',
  'Cinnamon': 'Cinnamomum verum',
  'Clove': 'Syzygium aromaticum',
  'Coriander': 'Coriandrum sativum',
  'Fennel': 'Foeniculum vulgare',
  'Fenugreek': 'Trigonella foenum-graecum',
  'Ajwain': 'Trachyspermum ammi',
  'Cumin': 'Cuminum cyminum',
  'Curry Leaves': 'Murraya koenigii',
  'Hibiscus': 'Hibiscus rosa-sinensis',
  'Nirgundi': 'Vitex negundo',
  'Ashoka': 'Saraca asoca',
  'Chirata': 'Swertia chirayita',
  'Shankhpushpi': 'Convolvulus pluricaulis',
  'Jatamansi': 'Nardostachys jatamansi',
  'Kutki': 'Picrorhiza kurroa',
  'Tagara': 'Valeriana wallichii',
  'Patha': 'Cissampelos pareira',
  'Anantamul': 'Hemidesmus indicus',
  'Bhumyamalaki': 'Phyllanthus niruri',
  'Kantakari': 'Solanum xanthocarpum',
  'Apamarga': 'Achyranthes aspera',
  'Eranda (Castor)': 'Ricinus communis',
  'Triphala': 'Terminalia chebula, Terminalia bellirica, Phyllanthus emblica' // Keeping Triphala for backwards compatibility
};

const HERBS = Object.keys(HERB_MASTER_DB);
const METHODS = ['Hand Picking','Cutting','Root Extraction','Bark Collection','Seed Collection'];
const GRADES = ['Grade A+','Grade A','Grade B+','Grade B','Grade C'];

function generateBatchId() {
  return `BATCH-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export default function CreateBatch() {
  const addBatch = useBatchStore(state => state.addBatch);
  // The signed-in centre becomes the batch's collectionCenter, which the
  // Government tracking screens filter on.
  const user = useAuthStore(state => state.user);
  const [batchId, setBatchId] = useState(generateBatchId());
  const [submitted, setSubmitted] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [form, setForm] = useState({
    collectorType: 'Farmer', collectorId: '', collectorName: '', species: '', botanicalName: '',
    quantity: '', unit: 'kg', harvestDate: '', method: '',
    region: '', gpsLocation: '', moisture: '', storageCondition: '',
    qualityObservations: '', estimatedGrade: '', sustainabilityNotes: '', remarks: '',
  });
  const [detectingLocation, setDetectingLocation] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Approved belt + season per species (public.species_rules) — fetched once
  // so the real-time GPS reading can be checked client-side the instant it's
  // captured, ahead of the database trigger that has the final say.
  const [zoneRules, setZoneRules] = useState<ZoneRule[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('species_rules')
        .select('species, min_lat, max_lat, min_lng, max_lng, harvest_month_start, harvest_month_end, zone_label');
      if (cancelled) return;
      if (error) console.error('Failed to load species zone rules:', error);
      else setZoneRules((data as ZoneRule[]) ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  const activeRule = zoneRules.find((r) => r.species === form.species);
  const gpsCoords = form.gpsLocation ? parseGps(form.gpsLocation) : null;
  const geofenceStatus: 'no-rule' | 'unknown' | 'in-zone' | 'out-of-zone' = !activeRule
    ? 'no-rule'
    : !gpsCoords
      ? 'unknown'
      : gpsCoords[0] >= activeRule.min_lat && gpsCoords[0] <= activeRule.max_lat &&
          gpsCoords[1] >= activeRule.min_lng && gpsCoords[1] <= activeRule.max_lng
        ? 'in-zone'
        : 'out-of-zone';
  const seasonStatus: 'no-rule' | 'in-season' | 'out-of-season' = !activeRule
    ? 'no-rule'
    : monthInSeason(new Date().getMonth() + 1, activeRule.harvest_month_start, activeRule.harvest_month_end)
      ? 'in-season'
      : 'out-of-season';

  // Once a real-time reading lands inside the species' approved belt, the zone
  // is known — fill the region from it rather than asking the collector to
  // type what the coordinates already say. Species with no configured rule
  // keep the region field manually editable, exactly as before.
  useEffect(() => {
    if (activeRule?.zone_label && geofenceStatus === 'in-zone' && form.region !== activeRule.zone_label) {
      set('region', activeRule.zone_label);
    }
  }, [activeRule, geofenceStatus]);

  // Government-approved collectors of the currently selected type. Switching the
  // type re-queries, so the name list always matches Farmer vs Wild Collector.
  const { members: collectors, loading: collectorsLoading, error: collectorsError } =
    useActiveMembers(form.collectorType as UserRole);

  const selectedCollector = collectors.find((m) => m.ayurvedicId === form.collectorId);

  // Everything after the collector card stays locked until one is chosen, so a
  // batch can never be recorded against an unidentified collector.
  const collectorChosen = Boolean(selectedCollector);

  const handleCollectorTypeChange = (type: string) => {
    // Clear the previous pick — a Farmer id is not valid under Wild Collector.
    setForm((f) => ({ ...f, collectorType: type, collectorId: '', collectorName: '' }));
  };

  const handleCollectorChange = (ayurvedicId: string) => {
    const member = collectors.find((m) => m.ayurvedicId === ayurvedicId);
    setForm((f) => ({
      ...f,
      collectorId: ayurvedicId,
      collectorName: member?.name ?? '',
      // Prefill the harvest region from the member's registered region; still editable.
      region: member?.region && !f.region ? member.region : f.region,
    }));
  };

  const generateAISummary = async () => {
    if (!form.species || !form.quantity) {
      toast.error('Please fill species and quantity first.');
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    const summary = `AI Quality Analysis: ${form.species} batch collected from ${form.region || 'specified region'}. Quantity: ${form.quantity} ${form.unit}. Harvest method: ${form.method || 'standard'}. Moisture content ${form.moisture ? form.moisture + '%' : 'within range'}. ${form.estimatedGrade ? `Estimated grade: ${form.estimatedGrade}.` : ''} ${form.qualityObservations || 'Preliminary visual inspection indicates acceptable quality.'} Blockchain verification ready. Forwarding to processing unit recommended.`;
    setAiSummary(summary);
    setGenerating(false);
    toast.success('AI summary generated successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollector) { toast.error(`Please select a ${form.collectorType.toLowerCase()} first.`); return; }
    if (!form.gpsLocation || !form.harvestDate) {
      toast.error('Press "Detect My Location" to capture a real-time GPS reading before submitting.');
      return;
    }
    if (geofenceStatus === 'out-of-zone') {
      toast.error(`This location is outside the approved harvesting belt for ${form.species}.`);
      return;
    }
    if (seasonStatus === 'out-of-season') {
      toast.error(`${form.species} is out of its approved harvest season right now.`);
      return;
    }
    if (!aiSummary) { toast.error('Please generate the AI summary before submitting.'); return; }
    await new Promise((r) => setTimeout(r, 1000));
    
    const centreName = user?.organizationName || 'Collection Centre';

    const newBatch: Batch = {
      id: `b-${Date.now()}`,
      batchNumber: batchId,
      species: form.species,
      botanicalName: form.botanicalName,
      // Numeric in the model — a string here reaches the database as "500".
      quantity: Number(form.quantity),
      unit: form.unit,
      collectionCenter: centreName,
      collectorName: selectedCollector.name,
      collectorType: form.collectorType as Batch['collectorType'],
      harvestDate: form.harvestDate,
      region: form.region,
      gpsLocation: form.gpsLocation || undefined,
      status: 'Processing',
      currentStage: 'Processing',
      estimatedGrade: form.estimatedGrade || undefined,
      moisture: form.moisture ? Number(form.moisture) : undefined,
      aiSummary,
      // Matches BatchTimelineEvent, the shape the traceability view reads.
      // The later stages are seeded as Pending so the full chain is visible.
      timeline: [
        {
          stage: 'Collection',
          timestamp: new Date().toISOString(),
          organization: centreName,
          // Attribute to the verified member, not a free-typed name.
          user: `${selectedCollector.name} (${selectedCollector.ayurvedicId})`,
          status: 'Completed',
          remarks: `Harvested ${form.quantity}${form.unit} of ${form.species} by ${form.collectorType} ${selectedCollector.name}.${form.method ? ` Method: ${form.method}.` : ''} Forwarded to Processing.`,
        },
        { stage: 'Processing', timestamp: '', organization: '', user: '', status: 'Pending' },
        { stage: 'Laboratory', timestamp: '', organization: '', user: '', status: 'Pending' },
        { stage: 'Manufacturing', timestamp: '', organization: '', user: '', status: 'Pending' },
        { stage: 'Supply Chain', timestamp: '', organization: '', user: '', status: 'Pending' },
      ],
    };
    
    // Persisted to Supabase — surface a failure instead of showing a success
    // screen for a batch that was never saved. A batch that couldn't reach
    // the network at all is queued rather than failed (see useBatchStore /
    // OfflineSyncStatus) — addBatch resolves normally for that case too, so
    // check the queue afterwards to tell the two apart.
    try {
      await addBatch(newBatch);
    } catch (err) {
      toast.error(
        `Batch could not be saved: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
      return;
    }

    const wasQueued = useBatchStore.getState().pendingSync.some((b) => b.id === newBatch.id);
    setQueuedOffline(wasQueued);
    setSubmitted(true);
    if (wasQueued) {
      toast.success(`Batch ${batchId} saved on this device — will sync once you're back online.`);
    } else {
      toast.success(`Batch ${batchId} created and forwarded to Processing & Laboratory!`);
    }
  };

  if (submitted) return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="max-w-lg mx-auto mt-12">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold font-heading">
            {queuedOffline ? 'Batch Saved — Syncing Later' : 'Batch Created!'}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {queuedOffline ? (
              <>Batch <span className="font-mono font-bold text-primary">{batchId}</span> is saved on this device.
                No connection was available to reach the ledger — it will upload automatically, with nothing
                re-entered, the moment you're back online.</>
            ) : (
              <>Batch <span className="font-mono font-bold text-primary">{batchId}</span> has been recorded on blockchain and forwarded to Processing & Laboratory.</>
            )}
          </p>
          <Button className="mt-6 bg-primary hover:bg-primary text-white" onClick={() => {
            setSubmitted(false);
            setQueuedOffline(false);
            setAiSummary('');
            setBatchId(generateBatchId());
            setForm({
              collectorType: 'Farmer', collectorId: '', collectorName: '', species: '', botanicalName: '',
              quantity: '', unit: 'kg', harvestDate: '', method: '',
              region: '', gpsLocation: '', moisture: '', storageCondition: '',
              qualityObservations: '', estimatedGrade: '', sustainabilityNotes: '', remarks: '',
            });
          }}>
            <Package className="w-4 h-4 mr-1.5" /> Create Another Batch
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Create New Batch"
        description="Record a new herb collection batch with complete details"
        badge={<span className="font-mono text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">{batchId}</span>}
      />

      <OfflineSyncStatus />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Collector Info — must be completed before the rest of the form unlocks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
              Collector Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Collector Type<span className="text-red-500">*</span></Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.collectorType}
                onChange={(e) => handleCollectorTypeChange(e.target.value)}
              >
                <option>Farmer</option><option>Wild Collector</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium">
                {form.collectorType} Name<span className="text-red-500">*</span>
              </Label>

              {collectorsLoading ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted/30 text-sm text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading approved {form.collectorType.toLowerCase()}s…
                </div>
              ) : collectorsError ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-destructive/40 bg-destructive/5 text-sm text-destructive">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Couldn&apos;t load list: {collectorsError}</span>
                </div>
              ) : collectors.length === 0 ? (
                <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-amber-500/40 bg-amber-500/5 text-sm">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    No approved {form.collectorType.toLowerCase()}s available. They must be approved
                    in the Government portal before a batch can be recorded against them.
                  </span>
                </div>
              ) : (
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.collectorId}
                  onChange={(e) => handleCollectorChange(e.target.value)}
                  required
                >
                  <option value="">Select {form.collectorType.toLowerCase()} name</option>
                  {collectors.map((m) => (
                    <option key={m.id} value={m.ayurvedicId}>
                      {m.name} — {m.ayurvedicId}
                      {m.region ? ` (${m.region})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Confirmation of who the batch will be attributed to */}
            {selectedCollector && (
              <div className="md:col-span-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <UserCheck className="w-4 h-4" />
                  {selectedCollector.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{selectedCollector.ayurvedicId}</span>
                {selectedCollector.phone && (
                  <span className="text-xs text-muted-foreground">{selectedCollector.phone}</span>
                )}
                {selectedCollector.region && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{selectedCollector.region}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gate: the remaining sections stay disabled until a collector is chosen. */}
        {!collectorChosen && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 shrink-0" />
            Select a {form.collectorType.toLowerCase()} above to continue filling in the batch details.
          </div>
        )}

        <fieldset
          disabled={!collectorChosen}
          className={!collectorChosen ? 'opacity-50 pointer-events-none select-none space-y-6' : 'space-y-6'}
        >

        {/* Herb Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Herb & Harvest Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Species<span className="text-red-500">*</span></Label>
              <select 
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                value={form.species} 
                onChange={(e) => {
                  const selectedSpecies = e.target.value;
                  setForm(f => ({
                    ...f, 
                    species: selectedSpecies, 
                    botanicalName: HERB_MASTER_DB[selectedSpecies] || ''
                  }));
                }} 
                required
              >
                <option value="">Select herb species</option>
                {HERBS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Botanical Name</Label>
              <Input 
                placeholder="Botanical name will be filled automatically" 
                value={form.botanicalName} 
                readOnly 
                tabIndex={-1}
                className="bg-muted/30 text-muted-foreground cursor-not-allowed focus-visible:ring-0" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Quantity<span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input type="number" placeholder="0" className="flex-1" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
                <select className="w-20 h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                  <option>kg</option><option>g</option><option>tonnes</option><option>litres</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Harvest Date & Time
              </Label>
              <Input
                readOnly
                tabIndex={-1}
                value={
                  form.harvestDate
                    ? new Date(form.harvestDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'Captured automatically when you detect your location'
                }
                className={`bg-muted/30 cursor-not-allowed focus-visible:ring-0 ${form.harvestDate ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
              />
              <p className="text-[11px] text-muted-foreground">
                Recorded at the exact moment of GPS capture below — not editable, so it can't be backdated.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Collection Method</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.method} onChange={(e) => set('method', e.target.value)}>
                <option value="">Select method</option>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Location & Condition */}
        <Card>
          <CardHeader><CardTitle className="text-base">Location & Quality</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
              <Label className="text-sm font-medium">
                GPS Location<span className="text-red-500">*</span>
                {activeRule && (
                  <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                    ({form.species} is geo-fenced — real-time position is checked against its approved belt)
                  </span>
                )}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                {/* Read-only: real-time capture only, no manually typed coordinates —
                    geo-fencing is meaningless against a number someone just typed in. */}
                <Input
                  readOnly
                  tabIndex={-1}
                  placeholder="Not yet captured — press Detect My Location"
                  className="pl-9 pr-40 bg-muted/30 cursor-not-allowed focus-visible:ring-0"
                  value={form.gpsLocation}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={detectingLocation}
                  className="absolute right-1 top-1 h-7 text-xs px-3 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm transition-colors"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      toast.error('Geolocation is not supported by your browser.');
                      return;
                    }
                    setDetectingLocation(true);
                    toast.loading('Detecting your location...', { id: 'gps-toast' });
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        // GPS and harvest timestamp are captured together — this
                        // click *is* the collection event, not a form field filled
                        // in after the fact.
                        setForm((f) => ({
                          ...f,
                          gpsLocation: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,
                          harvestDate: new Date().toISOString(),
                        }));
                        setDetectingLocation(false);
                        toast.success('Location captured — harvest date & time recorded.', { id: 'gps-toast' });
                      },
                      () => {
                        setDetectingLocation(false);
                        toast.error('Failed to detect location. Please ensure location permissions are granted.', { id: 'gps-toast' });
                      },
                      { enableHighAccuracy: true, timeout: 15000 },
                    );
                  }}
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  {detectingLocation ? 'Detecting…' : 'Detect My Location'}
                </Button>
              </div>

              {activeRule && form.gpsLocation && (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      geofenceStatus === 'in-zone'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                    }`}
                  >
                    {geofenceStatus === 'in-zone' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {geofenceStatus === 'in-zone' ? `Inside approved belt (${activeRule.zone_label ?? 'zone match'})` : 'Outside approved harvesting belt'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      seasonStatus === 'in-season'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                    }`}
                  >
                    {seasonStatus === 'in-season' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {seasonStatus === 'in-season' ? 'Within approved harvest season' : 'Outside approved harvest season'}
                  </span>
                </div>
              )}
              {(geofenceStatus === 'out-of-zone' || seasonStatus === 'out-of-season') && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  This submission will be rejected by the ledger — {form.species} may only be recorded inside its
                  approved belt and season (NMPB / GACP rule).
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Harvest Region<span className="text-red-500">*</span>
                {activeRule && geofenceStatus === 'in-zone' && (
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(from GPS)</span>
                )}
              </Label>
              <Input
                placeholder="e.g. Palakkad, Kerala"
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
                readOnly={Boolean(activeRule && geofenceStatus === 'in-zone')}
                className={activeRule && geofenceStatus === 'in-zone' ? 'bg-muted/30 cursor-not-allowed focus-visible:ring-0' : ''}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Moisture Content (%)</Label>
              <Input type="number" placeholder="e.g. 8.5" value={form.moisture} onChange={(e) => set('moisture', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Estimated Grade</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.estimatedGrade} onChange={(e) => set('estimatedGrade', e.target.value)}>
                <option value="">Select grade</option>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Storage Condition</Label>
              <Input placeholder="e.g. Cool & dry, 20°C" value={form.storageCondition} onChange={(e) => set('storageCondition', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Quality Observations</Label>
              <Input placeholder="Visual inspection notes" value={form.qualityObservations} onChange={(e) => set('qualityObservations', e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium">Sustainability Notes</Label>
              <Input placeholder="Organic certification, sustainable harvest notes..." value={form.sustainabilityNotes} onChange={(e) => set('sustainabilityNotes', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Remarks</Label>
              <Input placeholder="Any additional notes..." value={form.remarks} onChange={(e) => set('remarks', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader><CardTitle className="text-base">Photos & Documents</CardTitle></CardHeader>
          <CardContent>
            <DocumentUpload label="Click or drag files to upload Herb Photos, Field Images, Collection Certificates" />
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card className="border-primary/25 dark:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Quality Summary
            </CardTitle>
            <Button type="button" onClick={generateAISummary} disabled={generating} variant="outline" className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/6">
              {generating ? <><div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-1.5" />Generating...</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Generate AI Summary</>}
            </Button>
          </CardHeader>
          <CardContent>
            {aiSummary ? (
              <div className="p-4 rounded-lg bg-primary/6 dark:bg-primary/12 border border-primary/25 dark:border-primary/30">
                <p className="text-sm leading-relaxed">{aiSummary}</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border text-center text-sm text-muted-foreground">
                Fill in the herb details above, then click "Generate AI Summary"
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={!aiSummary} className="w-full h-11 bg-primary hover:bg-primary text-white font-semibold text-base">
          Submit Batch &amp; Forward to Processing Unit
        </Button>
        </fieldset>
      </form>
    </div>
  );
}
