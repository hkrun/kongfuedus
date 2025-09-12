type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  color?: "default" | "white";
};

export default function SectionHeading({ eyebrow, title, subtitle, align = "center", color = "default" }: Props) {
  const isWhite = color === "white";
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <div className={`${isWhite ? "text-white/80" : "text-primary"} text-sm font-medium mb-2`}>
          {eyebrow}
        </div>
      )}
      <h2 className={`text-3xl sm:text-4xl font-semibold tracking-tight ${isWhite ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 max-w-2xl mx-auto ${isWhite ? "text-white/70" : "text-gray-600"}`}>{subtitle}</p>
      )}
    </div>
  );
}

