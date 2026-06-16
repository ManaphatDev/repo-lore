import type { LoreChapter, NarrativeMode } from '@/types/analysis';
import { type LoreFacts, nameList } from './facts';

export interface ModeMeta {
  id: NarrativeMode;
  label: string;
  blurb: string;
  icon: string; // lucide-react icon name
}

export interface ModeVoice {
  meta: ModeMeta;
  title: (f: LoreFacts) => string;
  logline: (f: LoreFacts) => string;
  chapters: (f: LoreFacts) => LoreChapter[];
}

// --- helpers ---------------------------------------------------------------

function sentence(s: string): string {
  const trimmed = s.trim().replace(/[.\s]+$/, '');
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

const ch = (
  number: number,
  title: string,
  subtitle: string,
  paragraphs: string[],
): LoreChapter => ({ number, title, subtitle, paragraphs });

// ---------------------------------------------------------------------------
// 1. DOCUMENTARY
// ---------------------------------------------------------------------------

const documentary: ModeVoice = {
  meta: {
    id: 'documentary',
    label: 'Documentary',
    blurb: 'The chronicle as it truly happened — measured, unembellished.',
    icon: 'Clapperboard',
  },
  title: (f) => `${f.name}: A Development History`,
  logline: (f) =>
    `A factual reconstruction of ${f.name}'s evolution, drawn from ${f.ageLabel} of commits, ${f.releaseCount} ${f.releaseCount === 1 ? 'release' : 'releases'} and ${f.contributorsLabel} contributors.`,
  chapters: (f) => [
    ch(1, 'The Beginning', `${f.createdYear} · first commit`, [
      `In ${f.createdYear}, ${f.owner} published the first commit to ${f.name}${f.language !== 'code' ? `, a ${f.language} project` : ''}. ${
        f.description
          ? `It set out to ${sentence(f.description)}.`
          : 'Its ambitions were modest at first, a few files and an idea.'
      }`,
      `From the outset the repository was written chiefly in ${nameList(f.topLangs)}. What began as a single initiative would, over the next ${f.ageLabel}, accumulate *${f.stars}* stars and draw ${f.contributorsLabel} contributors into its orbit.`,
    ]),
    ch(2, 'Building Foundations', 'Structure and the first releases', [
      f.firstRelease
        ? `The early period was about foundations. Version *${f.firstRelease}* marked the first tagged release — the moment the project declared itself ready to be relied upon.`
        : `The early period was about foundations, laid commit by commit; formal releases would come later.`,
      `${f.architect ? `${f.architect} authored the largest share of this groundwork, shaping an architecture the project still rests on. ` : ''}${f.releaseCount > 1 ? `In all, ${f.releaseCount} releases would follow${f.cadenceDays ? `, arriving on average every ${f.cadenceDays} days` : ''}.` : ''}`,
      f.releaseCount > 0
        ? `Across ${f.releaseCount} tagged ${f.releaseCount === 1 ? 'release' : 'releases'}, the project ${f.reachedStable ? `crossed its 1.0 milestone${f.latestRelease ? ` (now ${f.latestRelease})` : ''}, declaring a stable interface` : 'kept its versions below 1.0, leaving its interface free to change'}.`
        : '',
    ]),
    ch(3, 'Rapid Growth', 'Acceleration', [
      `Momentum built. ${f.busiestMonth ? `Activity peaked around ${f.busiestMonth}, among the busiest stretches on record.` : 'Development accelerated noticeably.'} Commits arrived at roughly ${f.commitsPerWeek} per week as the project's reach widened to *${f.stars}* stars.`,
      `${f.featureBuilder ? `${f.featureBuilder} drove much of the new functionality${f.bugHunter ? `, while ${f.bugHunter} kept regressions in check` : ''}. ` : 'New functionality landed steadily alongside fixes. '}On the project's DNA it scored ${f.scores['Innovation']} for innovation and ${f.scores['Growth']} for growth.`,
      f.commitsPerWeek > 0
        ? `The cadence itself was ${f.rhythmTrend}${f.weekendPct > 0 ? `, with ${f.weekendPct}% of recent commits landing on weekends` : ''} — a signature of how the work was paced.`
        : '',
    ]),
    ch(4, 'Community Expansion', `${f.contributorsLabel} contributors`, [
      `As ${f.name} grew, so did the circle around it. ${f.contributorsLabel} contributors took part, with the top ${f.busFactor} authoring more than half of all commits, and *${f.forks}* forks branching into experiments and downstream work.`,
      `${f.champion ? `${f.champion} helped connect the project to its wider audience. ` : ''}${f.maintainer ? `${f.maintainer} kept the machinery running — dependencies current, the pipeline green. ` : ''}Community strength registered at ${f.scores['Community']} in its DNA.`,
      f.mergeRatePct != null
        ? `Of the pull requests it received, ${f.mergeRatePct}% were ultimately merged${f.mergeLatencyLabel ? `, typically within ${f.mergeLatencyLabel}` : ''} — a measure of how readily outside work was absorbed.`
        : '',
    ]),
    ch(5, 'Present Day', f.maturityStage, [
      `Today ${f.name} sits in its *${f.maturityStage}* phase. ${f.maturitySummary} ${f.archived ? 'The repository has since been archived.' : `Its most recent activity was ${f.daysSincePush < 1 ? 'today' : `${f.daysSincePush} days ago`}.`}`,
      `${f.latestRelease ? `The latest tagged release is *${f.latestRelease}*. ` : ''}After ${f.ageLabel}, ${f.name} stands at ${f.stars} stars and ${f.contributorsLabel} contributors${f.archived ? '.' : ', its history still being written.'}`,
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 2. FANTASY
// ---------------------------------------------------------------------------

const fantasy: ModeVoice = {
  meta: {
    id: 'fantasy',
    label: 'Fantasy',
    blurb: 'An epic of guilds, sworn oaths, and forged relics.',
    icon: 'Sparkles',
  },
  title: (f) => `The Chronicle of ${f.name}`,
  logline: (f) =>
    `An epic in five parts, recounting how a single spark was forged into a realm of ${f.stars} lanterns and ${f.contributorsLabel} sworn hands.`,
  chapters: (f) => [
    ch(1, 'The First Spark', `In the year ${f.createdYear}`, [
      `In the year ${f.createdYear} of the common reckoning, the artisan *${f.owner}* struck the first spark of ${f.name} into being${f.language !== 'code' ? `, forging it from raw ${f.language}` : ''}. ${f.description ? `It was sworn to ${sentence(f.description)}.` : 'None yet knew what it would become.'}`,
      `From one humble commit, a world began to unfold — its bones hewn from ${nameList(f.topLangs)}. The old texts promise that ${f.ageLabel} hence, ${f.stars} lanterns would be lit in its honour.`,
    ]),
    ch(2, 'Building the Keep', 'Foundations of stone', [
      `${f.architect ? `The master-builder *${f.architect}* raised the load-bearing walls, laying more stone than any other hand. ` : 'Patient hands raised the keep, course by course. '}${f.firstRelease ? `The first great seal, *${f.firstRelease}*, was pressed upon the gates — a sign the stronghold could at last bear weight.` : 'In time the stronghold could bear weight, though its seals came later.'}`,
      `${f.releaseCount > 1 ? `${f.releaseCount} seals in all would be struck${f.cadenceDays ? `, one roughly every ${f.cadenceDays} turns of the moon` : ''}. ` : ''}The shape of the realm grew certain, and its customs took root.`,
      f.releaseCount > 0
        ? `${f.reachedStable ? `The realm's charter was sealed at version 1.0${f.latestRelease ? ` and now bears the mark ${f.latestRelease}` : ''} — its laws set in stone` : "No charter yet bore the seal of 1.0; the realm's laws were still being drafted"}.`
        : '',
    ]),
    ch(3, 'The Age of Banners', 'The realm rises', [
      `Then came the age of banners. ${f.busiestMonth ? `Around ${f.busiestMonth} the forges blazed brightest, hammers ringing day and night.` : 'The forges blazed, and the work would not slow.'} ${f.featureBuilder ? `*${f.featureBuilder}* the Wright conjured new wonders, ` : 'New wonders were conjured, '}${f.bugHunter ? `while *${f.bugHunter}* the Warden hunted every lurking blight.` : 'and the blights were driven back.'}`,
      `Word spread across the lands, and ${f.stars} admirers raised their lanterns toward ${f.name}. Bards would later score its spirit at ${f.scores['Innovation']} for daring.`,
      f.commitsPerWeek > 0
        ? `The smiths' tempo was ${f.rhythmTrend}${f.weekendPct > 0 ? `; even on rest-days, ${f.weekendPct}% of the hammering rang out` : ''}.`
        : '',
    ]),
    ch(4, 'The Gathering of Guilds', `${f.contributorsLabel} sworn hands`, [
      `No keep stands on one pair of hands. ${f.contributorsLabel} sworn contributors gathered beneath the banner, though the eldest ${f.busFactor} carried more than half the burden. *${f.forks}* offshoot holds were founded in distant valleys.`,
      `${f.champion ? `*${f.champion}* rode between the holds, binding the fellowship together. ` : ''}${f.maintainer ? `*${f.maintainer}* the Steward kept the lamps trimmed and the stores full. ` : ''}The bonds of the guild measured ${f.scores['Community']} in strength.`,
      f.mergeRatePct != null
        ? `Of the petitions brought to its gates, ${f.mergeRatePct}% were granted${f.mergeLatencyLabel ? `, most within ${f.mergeLatencyLabel}` : ''} — a court that heard its supplicants.`
        : '',
    ]),
    ch(5, 'The Present Reckoning', f.maturityStage, [
      `And so we arrive at the present reckoning. The realm stands in its *${f.maturityStage}* age — ${sentence(f.maturitySummary)}. ${f.archived ? 'Its gates are now sealed, its chronicle preserved in amber.' : `The last hammer-fall echoed but ${f.daysSincePush < 1 ? 'this very day' : `${f.daysSincePush} days past`}.`}`,
      `${f.latestRelease ? `The newest seal upon the gate reads *${f.latestRelease}*. ` : ''}After ${f.ageLabel}, ${f.name} endures — ${f.stars} lanterns bright, ${f.contributorsLabel} hands sworn${f.archived ? ', its tale complete.' : ', and its tale not yet ended.'}`,
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 3. SCIENCE FICTION
// ---------------------------------------------------------------------------

const scifi: ModeVoice = {
  meta: {
    id: 'scifi',
    label: 'Science Fiction',
    blurb: "A starfarer's saga of ship logs and signals from the deep.",
    icon: 'Rocket',
  },
  title: (f) => `Vessel Log — ${f.name}`,
  logline: (f) =>
    `Mission record of the ${f.name} program. Crew complement: ${f.contributorsLabel}. Stardate ${f.createdYear} to present.`,
  chapters: (f) => [
    ch(1, 'Ignition', `Stardate ${f.createdYear}`, [
      `Stardate ${f.createdYear}. The ${f.name} system came online under the command of *${f.owner}*${f.language !== 'code' ? `, its core compiled in ${f.language}` : ''}. ${f.description ? `Primary directive: ${sentence(f.description)}.` : 'Mission parameters were, at first, undefined.'}`,
      `Initial telemetry showed a hull built from ${nameList(f.topLangs)}. Long-range projections — since confirmed — anticipated ${f.stars} signal-boosts and a crew of ${f.contributorsLabel} over ${f.ageLabel} of flight.`,
    ]),
    ch(2, 'Systems Online', 'First stable build', [
      `${f.architect ? `Chief engineer *${f.architect}* assembled the load-bearing subsystems, contributing more of the core than any other crew member. ` : 'The core subsystems were brought online methodically. '}${f.firstRelease ? `Firmware *${f.firstRelease}* was certified flight-ready — the first stable build to leave drydock.` : 'A stable build was eventually certified, though formal revisions came later.'}`,
      `${f.releaseCount > 1 ? `${f.releaseCount} firmware revisions would be deployed${f.cadenceDays ? `, roughly every ${f.cadenceDays} cycles` : ''}. ` : ''}Ship architecture stabilised; standard operating protocols were locked in.`,
      f.releaseCount > 0
        ? `${f.reachedStable ? `Firmware crossed the 1.0 certification${f.latestRelease ? `, currently ${f.latestRelease}` : ''} — the interface rated flight-stable` : 'Firmware remained below 1.0 — specifications still subject to revision'}.`
        : '',
    ]),
    ch(3, 'Full Burn', 'Maximum thrust', [
      `The engines reached full burn. ${f.busiestMonth ? `Sensor logs spike around ${f.busiestMonth}, a period of maximum throughput.` : 'Throughput climbed sharply.'} The drive sustained ~${f.commitsPerWeek} commits per cycle as the vessel's signal reached *${f.stars}* relays.`,
      `${f.featureBuilder ? `*${f.featureBuilder}* engineered new capability modules${f.bugHunter ? `, while *${f.bugHunter}* ran continuous diagnostics against system faults` : ''}. ` : 'New capability modules were integrated under load. '}Innovation index registered ${f.scores['Innovation']}; growth vector ${f.scores['Growth']}.`,
      f.commitsPerWeek > 0
        ? `Engine output was ${f.rhythmTrend}${f.weekendPct > 0 ? `, ${f.weekendPct}% of burns logged on weekend cycles` : ''}.`
        : '',
    ]),
    ch(4, 'The Crew Expands', `${f.contributorsLabel} aboard`, [
      `A vessel of this class cannot fly shorthanded. ${f.contributorsLabel} crew were logged aboard, though the senior ${f.busFactor} accounted for over half of all operations. *${f.forks}* escape pods — forks — launched toward independent missions.`,
      `${f.champion ? `*${f.champion}* maintained contact with the wider fleet. ` : ''}${f.maintainer ? `*${f.maintainer}* held the life-support systems steady — dependencies patched, pipelines nominal. ` : ''}Crew cohesion read ${f.scores['Community']} on the index.`,
      f.mergeRatePct != null
        ? `Of the transmissions it received, ${f.mergeRatePct}% were integrated into the mainline${f.mergeLatencyLabel ? `, usually within ${f.mergeLatencyLabel}` : ''} — a responsive command deck.`
        : '',
    ]),
    ch(5, 'Present Coordinates', f.maturityStage, [
      `Current status: *${f.maturityStage}*. ${f.maturitySummary} ${f.archived ? 'The vessel has been decommissioned and placed in long-term archive.' : `Last logged maneuver: ${f.daysSincePush < 1 ? 'this cycle' : `${f.daysSincePush} cycles ago`}.`}`,
      `${f.latestRelease ? `Active firmware: *${f.latestRelease}*. ` : ''}After ${f.ageLabel} in flight, ${f.name} holds position at ${f.stars} signal-boosts and ${f.contributorsLabel} crew${f.archived ? '. End of log.' : '. Mission ongoing.'}`,
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 4. CORPORATE REPORT
// ---------------------------------------------------------------------------

const corporate: ModeVoice = {
  meta: {
    id: 'corporate',
    label: 'Corporate Report',
    blurb: 'A boardroom epic of KPIs, synergy, and quarterly glory.',
    icon: 'Briefcase',
  },
  title: (f) => `${f.name}: Strategic Retrospective`,
  logline: (f) =>
    `An executive summary of the ${f.name} initiative across ${f.ageLabel} of operation. Prepared for stakeholder review.`,
  chapters: (f) => [
    ch(1, 'Inception', `FY ${f.createdYear}`, [
      `The ${f.name} initiative was greenlit in FY ${f.createdYear} under sponsorship of *${f.owner}*${f.language !== 'code' ? `, with ${f.language} selected as the primary technology stack` : ''}. ${f.description ? `The stated mandate: to ${sentence(f.description)}.` : 'Initial scope was deliberately lean.'}`,
      `Core competencies were established across ${nameList(f.topLangs)}. Forward-looking guidance projected ${f.stars} stars of market validation and a contributor headcount of ${f.contributorsLabel} over the planning horizon.`,
    ]),
    ch(2, 'Foundational Investment', 'Q1–Q2 deliverables', [
      `${f.architect ? `*${f.architect}* led foundational delivery, owning the largest share of committed work. ` : 'Foundational delivery proceeded on plan. '}${f.firstRelease ? `Release *${f.firstRelease}* shipped as the initiative's first GA milestone, de-risking downstream adoption.` : 'A general-availability milestone was reached, with formal versioning to follow.'}`,
      `${f.releaseCount > 1 ? `A total of ${f.releaseCount} releases were delivered${f.cadenceDays ? ` against an average cadence of ${f.cadenceDays} days` : ''}, evidencing a repeatable delivery motion. ` : ''}Architectural standards were ratified and operationalised.`,
      f.releaseCount > 0
        ? `The initiative ${f.reachedStable ? `reached 1.0 GA${f.latestRelease ? ` (currently ${f.latestRelease})` : ''}, formalising an API commitment to stakeholders` : 'remained pre-1.0, with interface stability still a roadmap item'}.`
        : '',
    ]),
    ch(3, 'Growth Phase', 'Scaling throughput', [
      `The initiative entered an aggressive growth phase. ${f.busiestMonth ? `Throughput peaked in ${f.busiestMonth}.` : 'Throughput scaled materially.'} Velocity averaged ${f.commitsPerWeek} commits/week, driving market validation to *${f.stars}* stars (YoY accretive).`,
      `${f.featureBuilder ? `*${f.featureBuilder}* owned the feature roadmap${f.bugHunter ? `; *${f.bugHunter}* owned quality assurance and defect burndown` : ''}. ` : 'Feature delivery and quality assurance ran in parallel. '}Innovation KPI: ${f.scores['Innovation']}/100. Growth KPI: ${f.scores['Growth']}/100.`,
      f.commitsPerWeek > 0
        ? `Delivery velocity was ${f.rhythmTrend}${f.weekendPct > 0 ? `, with ${f.weekendPct}% of output booked on weekends` : ''}.`
        : '',
    ]),
    ch(4, 'Ecosystem Expansion', `Headcount: ${f.contributorsLabel}`, [
      `Stakeholder engagement broadened. ${f.contributorsLabel} contributors were onboarded, with the top ${f.busFactor} representing a key-person dependency (>50% of output). *${f.forks}* forks indicate healthy downstream ecosystem adoption.`,
      `${f.champion ? `*${f.champion}* drove community and developer-relations outcomes. ` : ''}${f.maintainer ? `*${f.maintainer}* owned operational excellence and dependency hygiene. ` : ''}Community KPI closed at ${f.scores['Community']}/100.`,
      f.mergeRatePct != null
        ? `Contribution intake ran at a ${f.mergeRatePct}% merge rate${f.mergeLatencyLabel ? ` with a median cycle time of ${f.mergeLatencyLabel}` : ''}, evidencing an efficient review pipeline.`
        : '',
    ]),
    ch(5, 'Outlook', f.maturityStage, [
      `Current portfolio status: *${f.maturityStage}*. ${f.maturitySummary} ${f.archived ? 'The initiative has been formally sunset and archived.' : `Most recent activity was recorded ${f.daysSincePush < 1 ? 'today' : `${f.daysSincePush} days ago`}.`}`,
      `${f.latestRelease ? `Current production version: *${f.latestRelease}*. ` : ''}In summary, after ${f.ageLabel}, ${f.name} has returned ${f.stars} stars and ${f.contributorsLabel} contributors of value${f.archived ? '. No further investment is planned.' : '. Recommend continued investment.'}`,
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 5. FUNNY MEME STYLE
// ---------------------------------------------------------------------------

const meme: ModeVoice = {
  meta: {
    id: 'meme',
    label: 'Meme Style',
    blurb: 'The lore gone feral — extremely online, zero chill.',
    icon: 'Laugh',
  },
  title: (f) => `${f.name}: the lore (gone wrong???)`,
  logline: (f) =>
    `ok so basically ${f.name} pulled up in ${f.createdYear} and now it's sitting on ${f.stars} stars 💀 buckle up`,
  chapters: (f) => [
    ch(1, 'the origin arc', `${f.createdYear}, a simpler time`, [
      `${f.createdYear}: *${f.owner}* said "what if i just... built a thing"${f.language !== 'code' ? ` in ${f.language}` : ''} and lowkey changed everything. ${f.description ? `the whole point was to ${sentence(f.description)} btw.` : 'no roadmap, just vibes.'}`,
      `started as a humble lil repo written in ${nameList(f.topLangs)}. fast forward ${f.ageLabel} and it's got *${f.stars}* stars and ${f.contributorsLabel} people in the gc. inspirational fr 🫡`,
    ]),
    ch(2, 'building in public (the grind)', 'foundations era', [
      `${f.architect ? `*${f.architect}* was absolutely carrying 🛠️ wrote more of this thing than anyone, no notes. ` : 'the grind was real, commit after commit. '}${f.firstRelease ? `then *${f.firstRelease}* dropped and it was OVER for the haters — first real release, we up.` : 'releases? later. the vision? immaculate.'}`,
      `${f.releaseCount > 1 ? `ended up shipping ${f.releaseCount} releases${f.cadenceDays ? ` (roughly every ${f.cadenceDays} days, chronically online behaviour)` : ''}. ` : ''}the codebase started looking like an actual codebase. character development 📈`,
      f.releaseCount > 0
        ? `also it ${f.reachedStable ? `hit 1.0${f.latestRelease ? ` (we on ${f.latestRelease} now)` : ''} so the API is locked in fr` : 'is still pre-1.0 so like... anything can change, stay on ur toes 😭'}`
        : '',
    ]),
    ch(3, 'the glow up', 'rapid growth saga', [
      `and THEN it glowed up. ${f.busiestMonth ? `${f.busiestMonth} was unhinged, commits flying everywhere.` : 'the commits would not stop.'} like ${f.commitsPerWeek} commits a week?? touch grass challenge: failed. meanwhile the star count hit *${f.stars}* 💫`,
      `${f.featureBuilder ? `*${f.featureBuilder}* cooking up features nonstop 🔥${f.bugHunter ? ` while *${f.bugHunter}* was on bug patrol like a menace 🐛🔨` : ''}. ` : 'features dropping left and right. '}innovation score: ${f.scores['Innovation']}/100. absolute unit.`,
      f.commitsPerWeek > 0
        ? `the pace was straight up ${f.rhythmTrend}${f.weekendPct > 0 ? ` and ${f.weekendPct}% of commits were on WEEKENDS (touch grass challenge: still failed)` : ''} 📈`
        : '',
    ]),
    ch(4, 'the community ascends', `${f.contributorsLabel} homies`, [
      `the squad got HUGE. ${f.contributorsLabel} contributors pulled up, tho ngl the top ${f.busFactor} are doing like half the work (we see you 👀). *${f.forks}* forks too — everybody wants a piece.`,
      `${f.champion ? `*${f.champion}* keeping the community vibes immaculate 💬 ` : ''}${f.maintainer ? `*${f.maintainer}* on dependency duty so nothing explodes 🧯 ` : ''}community score? ${f.scores['Community']}/100. wholesome 100.`,
      f.mergeRatePct != null
        ? `oh and ${f.mergeRatePct}% of PRs actually got merged${f.mergeLatencyLabel ? ` (usually within ${f.mergeLatencyLabel})` : ''} — they really said "your PR? accepted" 🤝`
        : '',
    ]),
    ch(5, 'present day (we made it)', f.maturityStage, [
      `current status: *${f.maturityStage}*. ${sentence(f.maturitySummary)} ${f.archived ? 'rip it got archived 🪦 F in the chat' : `last commit was ${f.daysSincePush < 1 ? 'literally today (down bad)' : `${f.daysSincePush} days ago`}.`}`,
      `${f.latestRelease ? `latest release is *${f.latestRelease}* 📦 ` : ''}tldr: ${f.ageLabel} later, ${f.name} is sitting on ${f.stars} stars and ${f.contributorsLabel} contributors${f.archived ? '. legends never die 💀' : '. the lore continues 🫡'}`,
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 6. NOIR DETECTIVE
// ---------------------------------------------------------------------------

const noir: ModeVoice = {
  meta: {
    id: 'noir',
    label: 'Noir Detective',
    blurb: 'A hard-boiled case file. Rain-slicked commits and shadowed pull requests.',
    icon: 'Search',
  },
  title: (f) => `The ${f.name} File`,
  logline: (f) =>
    `A PI's account of ${f.name} — ${f.ageLabel} of leads, *${f.stars}* cold tips and ${f.contributorsLabel} persons of interest.`,
  chapters: (f) => [
    ch(1, 'The Case Opens', `${f.createdYear} — a dark and stormy repo`, [
      `${f.createdYear}. The repo walked into my office${f.language !== 'code' ? `, reeking of ${f.language}` : ''}. *${f.owner}* was the name on the file. ${f.description ? `Said they were trying to ${sentence(f.description)}.` : "Wouldn't say much. Never do."} I'd seen the type before.`,
      `The codebase was built from ${nameList(f.topLangs)}. Modest at first — a few files, a few secrets. ${f.ageLabel} later it'd have *${f.stars}* stars and ${f.contributorsLabel} names in the ledger. Something smelled.`,
    ]),
    ch(2, 'The Foundation Rap Sheet', 'Early evidence', [
      `${f.architect ? `*${f.architect}* did most of the heavy lifting in those early days. More commits than anyone. Fingers in every corner. ` : 'The early work was clean. Methodical. No fingerprints worth finding. '}${f.firstRelease ? `First tagged release: *${f.firstRelease}*. The moment someone decided the thing was ready to be trusted.` : 'No tagged releases. They wanted it off the books.'}`,
      `${f.releaseCount > 1 ? `${f.releaseCount} releases in all${f.cadenceDays ? `, one every ${f.cadenceDays} days on average — like clockwork` : ''}. ` : ''}The architecture held. Whatever they were building, they built it to last.`,
      f.releaseCount > 0
        ? `${f.reachedStable ? `Hit 1.0${f.latestRelease ? ` — running as *${f.latestRelease}* now` : ''}. Stable. Official. Above board.` : 'Still pre-1.0. The interface stays flexible. Could change at any time. Slippery.'}`
        : '',
    ]),
    ch(3, 'The Trail Goes Hot', 'Acceleration', [
      `Then things moved fast. ${f.busiestMonth ? `${f.busiestMonth} — the hottest stretch on record.` : 'The commits wouldn\'t stop.'} About ${f.commitsPerWeek} a week. Someone was in a hurry. The star count hit *${f.stars}* and kept climbing.`,
      `${f.featureBuilder ? `*${f.featureBuilder}* was pushing new angles${f.bugHunter ? `, while *${f.bugHunter}* was mopping up the mess` : ''}. ` : 'New angles, new angles — always new angles. '}Innovation score: ${f.scores['Innovation']}. Growth: ${f.scores['Growth']}. The numbers don't lie.`,
      f.commitsPerWeek > 0
        ? `The pace was ${f.rhythmTrend}${f.weekendPct > 0 ? ` — ${f.weekendPct}% of the work happened on weekends. These people had no life. Good detectives never do` : ''}.`
        : '',
    ]),
    ch(4, 'The Usual Suspects', `${f.contributorsLabel} persons of interest`, [
      `${f.contributorsLabel} contributors in the file. The top ${f.busFactor} carried more than half the load — they always do. *${f.forks}* forks out in the dark, each one a copy of the evidence trail.`,
      `${f.champion ? `*${f.champion}* kept the community talking. Useful. Dangerous. ` : ''}${f.maintainer ? `*${f.maintainer}* kept the pipes from bursting — dependencies patched, the CI green. The kind of work nobody notices until it stops. ` : ''}Community score: ${f.scores['Community']}. Tight enough.`,
      f.mergeRatePct != null
        ? `${f.mergeRatePct}% of pull requests made it through${f.mergeLatencyLabel ? ` — median turnaround ${f.mergeLatencyLabel}` : ''}. A tight review process. Somebody was watching the door.`
        : '',
    ]),
    ch(5, 'Case Status', f.maturityStage, [
      `Current status: *${f.maturityStage}*. ${f.maturitySummary} ${f.archived ? 'The repo has been archived. The case is cold.' : `Last commit: ${f.daysSincePush < 1 ? 'today. Still active.' : `${f.daysSincePush} days ago. Getting colder.`}`}`,
      `${f.latestRelease ? `Latest release on file: *${f.latestRelease}*. ` : ''}After ${f.ageLabel}, the dossier reads ${f.stars} stars and ${f.contributorsLabel} names. I've closed worse cases${f.archived ? '.' : ' — but this one isn\'t closed yet.'}`,
    ]),
  ],
};

// ---------------------------------------------------------------------------
// 7. BREAKING NEWS
// ---------------------------------------------------------------------------

const news: ModeVoice = {
  meta: {
    id: 'news',
    label: 'Breaking News',
    blurb: 'Live from the dev desk — fast-moving developments, back to you in the studio.',
    icon: 'Newspaper',
  },
  title: (f) => `BREAKING: ${f.name} — Full Coverage`,
  logline: (f) =>
    `Live desk coverage of the ${f.name} story. ${f.ageLabel} of developments, *${f.stars}* community signals and ${f.contributorsLabel} sources confirmed.`,
  chapters: (f) => [
    ch(1, 'Developing Story', `Breaking — ${f.createdYear}`, [
      `BREAKING: We're getting reports out of ${f.createdYear} that *${f.owner}* has launched a new repository${f.language !== 'code' ? `, built entirely in ${f.language}` : ''}. ${f.description ? `Sources confirm the stated mission: to ${sentence(f.description)}.` : 'Officials have not yet released details on the scope of the initiative.'} We will continue to follow this story.`,
      `Early intelligence suggests the project is written in ${nameList(f.topLangs)}. Analysts are projecting *${f.stars}* stars and ${f.contributorsLabel} contributors over the next ${f.ageLabel}. Extraordinary, if confirmed. Back to you.`,
    ]),
    ch(2, 'Confirmed: First Release', 'Field report', [
      `We go now to our infrastructure correspondent. ${f.architect ? `*${f.architect}* has reportedly been on the ground since day one, logging more commits than any other source — we're told the core architecture bears their fingerprint. ` : 'Our field team confirms the foundational work has been laid. '}${f.firstRelease ? `CONFIRMED: version *${f.firstRelease}* has been tagged and released — the repo's first public milestone.` : 'No formal release has been tagged at this point — officials are keeping the version fluid.'}`,
      `${f.releaseCount > 1 ? `We can now confirm a total of ${f.releaseCount} releases${f.cadenceDays ? `, with an average cadence of ${f.cadenceDays} days between drops` : ''}. ` : ''}The project's infrastructure appears stable. We'll bring you updates as they come.`,
      f.releaseCount > 0
        ? `${f.reachedStable ? `Version 1.0 has been reached${f.latestRelease ? ` — the project is now running *${f.latestRelease}*` : ''}. A stable public API has been declared.` : 'The project remains pre-1.0. No stable API commitment has been made at this time.'}`
        : '',
    ]),
    ch(3, 'ALERT: Rapid Growth', 'This just in', [
      `We interrupt this broadcast with a development alert. ${f.busiestMonth ? `Activity readings from ${f.busiestMonth} are unprecedented — our analysts are calling it the busiest period on record.` : 'Commit volume has surged to extraordinary levels.'} We're tracking approximately ${f.commitsPerWeek} commits per week as the project crosses *${f.stars}* stars.`,
      `${f.featureBuilder ? `Our source *${f.featureBuilder}* has been identified as a key figure in the feature push${f.bugHunter ? `, with *${f.bugHunter}* confirmed as lead on defect remediation` : ''}. ` : 'Unconfirmed reports of rapid feature development are coming in. '}Innovation index: ${f.scores['Innovation']}. Growth index: ${f.scores['Growth']}. These are significant numbers.`,
      f.commitsPerWeek > 0
        ? `Our data desk confirms the velocity trend is ${f.rhythmTrend}${f.weekendPct > 0 ? `. Notably, ${f.weekendPct}% of recent commits originated over the weekend — our correspondents say they've never seen anything quite like it` : ''}.`
        : '',
    ]),
    ch(4, 'Community Response', `${f.contributorsLabel} sources`, [
      `We're now hearing from ${f.contributorsLabel} confirmed contributors. Our reporters on the ground note that the top ${f.busFactor} accounts for over half of all output. *${f.forks}* derivative projects have been independently verified — the story is spreading.`,
      `${f.champion ? `*${f.champion}* has been a key liaison between the project and external stakeholders. ` : ''}${f.maintainer ? `*${f.maintainer}* continues to manage dependencies and keep the delivery pipeline operational. ` : ''}Community engagement reads ${f.scores['Community']} — above average, our experts say.`,
      f.mergeRatePct != null
        ? `Of all incoming pull requests, ${f.mergeRatePct}% have been accepted${f.mergeLatencyLabel ? ` with a median response time of ${f.mergeLatencyLabel}` : ''}. This is a story of openness and accountability.`
        : '',
    ]),
    ch(5, 'Live Update', f.maturityStage, [
      `We can now report the project's current status as: *${f.maturityStage}*. ${f.maturitySummary} ${f.archived ? 'Officials confirm the repository has been archived. This chapter of the story is closed.' : `The most recent activity was logged ${f.daysSincePush < 1 ? 'today — this is a live situation' : `${f.daysSincePush} days ago`}.`}`,
      `${f.latestRelease ? `The latest confirmed release is *${f.latestRelease}*. ` : ''}After ${f.ageLabel} of coverage, the ${f.name} story stands at *${f.stars}* stars and ${f.contributorsLabel} contributors${f.archived ? '. We thank you for watching.' : '. We will continue to monitor developments. Stay with us.'}`,
    ]),
  ],
};

export const MODES: Record<NarrativeMode, ModeVoice> = {
  documentary,
  fantasy,
  scifi,
  corporate,
  meme,
  noir,
  news,
};

export const MODE_LIST: ModeMeta[] = [
  documentary.meta,
  fantasy.meta,
  scifi.meta,
  corporate.meta,
  meme.meta,
  noir.meta,
  news.meta,
];
