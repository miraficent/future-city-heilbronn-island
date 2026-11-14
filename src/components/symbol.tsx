/**
 * Alle UI-Symbole der App – Lucide (Strich 2, runde Enden), siehe DESIGN.md § Icons.
 * Die Namen bleiben gleich wie früher, damit alle Seiten unverändert weiter funktionieren.
 * Keine Emojis (Teamregel, tests/lib/emoji.test.ts).
 */
import type { CSSProperties } from "react";
import {
  ArrowLeft, ArrowRight, Backpack, Baby, Book, BookOpen, Bot, Building2, Cake, Calendar, Check, Clock, Code, Compass, Cpu,
  Drama, Euro, ExternalLink, Gamepad2, GraduationCap, Heart, House, Info, Landmark, Leaf, Lightbulb, Mail, Map, MapPin,
  Maximize2, Minimize2, Minus, Moon, Music, Orbit, Pause, Phone, Play, Plus, RefreshCw, Rocket, Search, Share2, Sparkles,
  Star, Store, Sun, Telescope, Ticket, TrainFront, User, Users, Volume2, VolumeX, Wrench, X, type LucideIcon,
} from "lucide-react";

const SYMBOLE: Record<string, LucideIcon> = {
  robot: Bot,
  controller: Gamepad2,
  search: Search,
  story: BookOpen,
  tools: Wrench,
  planet: Orbit,
  compass: Compass,
  backpack: Backpack,
  star: Star,
  code: Code,
  rocket: Rocket,
  volume: Volume2,
  mute: VolumeX,
  music: Music,
  book: Book,
  masks: Drama,
  museum: Landmark,
  phone: Phone,
  mail: Mail,
  train: TrainFront,
  arrow: ArrowRight,
  back: ArrowLeft,
  check: Check,
  close: X,
  pause: Pause,
  play: Play,
  leaf: Leaf,
  plus: Plus,
  minus: Minus,
  expand: Maximize2,
  shrink: Minimize2,
  map: Map,
  bulb: Lightbulb,
  share: Share2,
  calendar: Calendar,
  pin: MapPin,
  home: House,
  user: User,
  users: Users,
  info: Info,
  refresh: RefreshCw,
  euro: Euro,
  cake: Cake,
  ticket: Ticket,
  external: ExternalLink,
  clock: Clock,
  building: Building2,
  sun: Sun,
  moon: Moon,
  heart: Heart,
  sparkles: Sparkles,
  telescope: Telescope,
  chip: Cpu,
  store: Store,
  baby: Baby,
  school: GraduationCap,
};

export function Symbol({ name, className = "", style }: { name: string; className?: string; style?: CSSProperties }) {
  const Icon = SYMBOLE[name] ?? Compass;
  return <Icon className={`symbol ${className}`} style={style} strokeWidth={2} aria-hidden="true" focusable="false" />;
}
