// Pure CSS animation — no client directive needed
const DEFAULT_SKILLS = [
  "REACT",
  "NEXT.JS",
  "NODE.JS",
  "TYPESCRIPT",
  "POSTGRESQL",
  "MONGODB",
  "DOCKER",
  "AWS",
  "TAILWIND CSS",
  "GRAPHQL",
  "REDIS",
  "PRISMA",
  "REST API",
  "GIT",
  "LINUX",
];

interface SkillsTickerProps {
  skills?: string[];
}

export default function SkillsTicker({ skills }: SkillsTickerProps) {
  const list = skills && skills.length > 0 ? skills : DEFAULT_SKILLS;
  // Double the list so the CSS scroll loops seamlessly
  const doubled = [...list, ...list];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((skill, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-num">{String((i % list.length) + 1).padStart(2, "0")}</span>
            {skill}
            <span className="ticker-sep">▌</span>
          </span>
        ))}
      </div>
    </div>
  );
}
