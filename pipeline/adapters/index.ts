import type { Quelle, RohAngebot } from "../../src/lib/angebot";
import type { Http } from "../http";
import { ladeExperimentaKalender } from "./experimenta-kalender";
import { ladeKuferHtml } from "./kufer-html";
import { ladeKuferWpApi } from "./kufer-wp-api";
import { ladeWpSitemapEvents } from "./wp-sitemap-events";

export type Adapter = (quelle: Quelle, http: Http) => Promise<RohAngebot[]>;

/**
 * Welche Adapter es gibt. Der Name steht in quellen.csv in der Spalte „adapter“.
 * Eine neue Einrichtung mit bekanntem System (z. B. eine weitere VHS mit KuferWeb)
 * braucht nur eine neue Tabellenzeile – kein neuer Code.
 */
export const ADAPTER: Record<string, Adapter> = {
  "kufer-wp-api": ladeKuferWpApi,
  "kufer-html": ladeKuferHtml,
  "experimenta-kalender": ladeExperimentaKalender,
  "wp-sitemap-events": ladeWpSitemapEvents,
};
