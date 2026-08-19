import type { ConcesionRecord, Snapshot } from "./types";

// Organ IDs that publish subsidies to political parties (from the infosubvenciones
// party-subsidies view). The dedicated endpoint already scopes results to parties.
const ORGANOS = "7133,2567,392,3928,104,305,655,1885,674,663,65,173,1896";
const BASE = "https://www.infosubvenciones.es/bdnstrans/api";

interface BusquedaResponse {
  content: ConcesionRecord[];
  totalElements: number;
  totalPages: number;
}

// Fetch every party-subsidy concession from BDNS (SNPSAP). The endpoint returns the
// full set (a few hundred rows) in one page; we still paginate defensively.
export async function fetchPartySubsidies(): Promise<Snapshot> {
  const pageSize = 1000;
  const all: ConcesionRecord[] = [];
  let page = 0;
  let totalPages = 1;

  do {
    const url =
      `${BASE}/partidospoliticos/busqueda?vpd=GE&tipoAdministracion=C` +
      `&organos=${ORGANOS}&page=${page}&pageSize=${pageSize}` +
      `&order=fechaConcesion&direccion=desc`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Never serve a stale cached BDNS response from the refresh path.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`BDNS responded ${res.status} for page ${page}`);
    }
    const data = (await res.json()) as BusquedaResponse;
    all.push(...(data.content ?? []));
    totalPages = data.totalPages || 1;
    page += 1;
  } while (page < totalPages);

  return {
    generatedAt: new Date().toISOString(),
    source: {
      system: "BDNS / SNPSAP (infosubvenciones.es)",
      query: "/api/partidospoliticos/busqueda",
      organos: ORGANOS,
      url: "https://www.infosubvenciones.es/bdnstrans/GE/es/concesiones/partidosPoliticos",
    },
    records: all,
  };
}
