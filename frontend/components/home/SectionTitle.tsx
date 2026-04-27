type SectionTitleProps = {
  title: string;
  subtitle: string;
};

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
