const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-heading text-gradient-amber">AR</span>
          <span className="text-sm text-muted-foreground font-body">
            Alex Rocha · Business Intelligence
          </span>
        </div>
        <p className="text-xs text-muted-foreground/60 font-body">
          Dados fictícios para fins de demonstração
        </p>
      </div>
    </footer>
  );
};

export default Footer;
