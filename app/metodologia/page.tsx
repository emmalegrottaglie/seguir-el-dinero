import Link from "next/link";
import { getAggregation } from "@/lib/data";
import { euro, integer, formatDate } from "@/lib/format";

export const revalidate = 3600;

export const metadata = {
  title: "Metodología · Seguir el Dinero",
};

export default async function MetodologiaPage() {
  const agg = await getAggregation();
  return (
    <main className="mx-auto max-w-3xl px-5 pb-8">
      <Link href="/" className="label-mono inline-block py-4 hover:text-[var(--gold)]">
        ← Volver al panel
      </Link>

      <h1 className="display mt-4 text-4xl sm:text-5xl">Metodología y límites</h1>
      <p className="mt-6 text-lg text-[var(--paper-dim)]">
        Esta herramienta es honesta sobre lo que puede y no puede mostrar. Léelo antes de
        sacar conclusiones.
      </p>

      <Block title="Qué muestra">
        <p>
          Las <strong>subvenciones públicas estatales</strong> concedidas a los partidos
          políticos, extraídas en directo de la <em>Base de Datos Nacional de Subvenciones</em>{" "}
          (BDNS / SNPSAP), el registro oficial del Ministerio de Hacienda. Actualmente{" "}
          <strong>{integer(agg.parties.length)} partidos</strong> y un total de{" "}
          <strong>{euro(agg.grandTotal)}</strong>. Datos actualizados el{" "}
          {formatDate(agg.generatedAt.slice(0, 10))}.
        </p>
        <p>Se distinguen dos tipos de ayuda estatal anual:</p>
        <ul>
          <li>
            <strong>Financiación ordinaria</strong> — la subvención principal, repartida según
            representación parlamentaria.
          </li>
          <li>
            <strong>Gastos de seguridad</strong> — ayudas para gastos de protección.
          </li>
        </ul>
      </Block>

      <Block title="Financiación privada (parcial)">
        <p>
          Cada partido muestra también sus <strong>donaciones privadas declaradas</strong>,
          transcritas del <em>Informe nº 1573 del Tribunal de Cuentas</em> (ejercicio 2020). Con
          dos advertencias importantes:
        </p>
        <ul>
          <li>
            <strong>Las donaciones de empresas están prohibidas.</strong> Desde la reforma de 2015
            de la Ley Orgánica 8/2007, las personas jurídicas no pueden donar a partidos; sólo
            personas físicas, con un máximo de 50.000 €/año y sin donaciones anónimas.
          </li>
          <li>
            <strong>Lo privado no es un API.</strong> Estos datos sólo se publican en los informes
            anuales en PDF del Tribunal de Cuentas, con uno o dos años de retraso; por eso es una
            foto fija de 2020 y no un dato en directo.
          </li>
        </ul>
      </Block>

      <Block title="Políticos individuales">
        <p>
          La sección <em>Caras</em> reúne políticos individuales con su partido, su actividad en{" "}
          <strong>Bluesky</strong> y los titulares en los que aparecen. No hay una cifra de
          «financiación por político»: las subvenciones se conceden al partido, no a la persona.
          Cada perfil de Bluesky se ha <strong>verificado uno a uno</strong>; a día de hoy la
          izquierda tiene más presencia allí, y líderes de PP y Vox no tienen cuenta verificable.
        </p>
      </Block>

      <Block title="Hoja de ruta">
        <ul>
          <li>
            <strong>Hecho</strong> — Subvenciones públicas en directo (BDNS); donaciones privadas
            2020 (Tribunal de Cuentas); políticos individuales con Bluesky y noticias.
          </li>
          <li>
            <strong>Siguiente</strong> — Más ejercicios de donaciones del Tribunal de Cuentas y
            fundaciones vinculadas a partidos (ingesta periódica de PDF, no en directo).
          </li>
          <li>
            <strong>Después</strong> — Contratación pública y grafo de vínculos entre partidos,
            fundaciones y adjudicatarios, etiquetado siempre como <em>asociación, no prueba de
            influencia</em>.
          </li>
        </ul>
      </Block>

      <Block title="Fuentes">
        <ul>
          <li>
            <a className="src" href="https://www.infosubvenciones.es/bdnstrans/GE/es/concesiones/partidosPoliticos" target="_blank" rel="noopener noreferrer">
              BDNS / SNPSAP — concesiones a partidos políticos ↗
            </a>
          </li>
          <li>
            <a className="src" href="https://www.tcu.es/es/partidos-politicos/" target="_blank" rel="noopener noreferrer">
              Tribunal de Cuentas — partidos políticos ↗
            </a>
          </li>
          <li>
            <a className="src" href="https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022" target="_blank" rel="noopener noreferrer">
              Ley Orgánica 8/2007 sobre financiación de partidos ↗
            </a>
          </li>
        </ul>
      </Block>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="display section-tick text-2xl">{title}</h2>
      <div className="prose-dossier mt-8 flex flex-col gap-4 text-[var(--paper-dim)] leading-relaxed">
        {children}
      </div>
    </section>
  );
}
