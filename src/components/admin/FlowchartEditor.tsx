import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlowchartStepList from "./FlowchartStepList";
import FlowchartDiagramEditor from "./FlowchartDiagramEditor";
import { type Flowchart } from "@/hooks/useContent";


interface Props {
  chart: Flowchart;
  onBack: () => void;
}

const FlowchartEditor = ({ chart, onBack }: Props) => {
  const { data, isLoading } = useFlowchartDetail(chart.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos fluxogramas
        </button>
        <span className="text-sm font-heading text-foreground">{chart.title}</span>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Etapas (lista)</TabsTrigger>
          <TabsTrigger value="diagram">Diagrama (clicando)</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <p className="text-xs text-muted-foreground font-body mb-3">
            Cadastre etapa por etapa. Em "Vem depois de" você escolhe de onde a seta
            parte — marque mais de uma para juntar ramificações, e crie duas etapas com a
            mesma anterior para abrir caminhos paralelos. O desenho é gerado
            automaticamente.
          </p>
          <FlowchartStepList flowchartId={chart.id} />
        </TabsContent>

        <TabsContent value="diagram" className="mt-4">
          <FlowchartDiagramEditor flowchartId={chart.id} />
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default FlowchartEditor;
