import { useState } from "react";
import { Gift, Users, Shuffle, Trash2, Plus, Sparkles, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Assignment {
  giver: string;
  receiver: string;
  revealed: boolean;
}

type GamePhase = "setup" | "reveal";

const SecretSantaGame = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealingCard, setRevealingCard] = useState<string | null>(null);

  const addParticipant = () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast({
        title: "Nombre vacío",
        description: "Por favor, introduce un nombre válido.",
        variant: "destructive",
      });
      return;
    }
    if (participants.includes(trimmedName)) {
      toast({
        title: "Nombre duplicado",
        description: "Este participante ya está en la lista.",
        variant: "destructive",
      });
      return;
    }
    setParticipants([...participants, trimmedName]);
    setNewName("");
    toast({
      title: "¡Participante añadido!",
      description: `${trimmedName} se ha unido al juego.`,
    });
  };

  const removeParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const performDraw = () => {
    if (participants.length < 2) {
      toast({
        title: "Pocos participantes",
        description: "Necesitas al menos 2 participantes para el sorteo.",
        variant: "destructive",
      });
      return;
    }

    setIsShuffling(true);

    setTimeout(() => {
      let receivers = shuffleArray(participants);
      
      let attempts = 0;
      while (attempts < 100) {
        let valid = true;
        for (let i = 0; i < participants.length; i++) {
          if (participants[i] === receivers[i]) {
            valid = false;
            break;
          }
        }
        if (valid) break;
        receivers = shuffleArray(participants);
        attempts++;
      }

      const newAssignments: Assignment[] = participants.map((giver, index) => ({
        giver,
        receiver: receivers[index],
        revealed: false,
      }));

      setAssignments(newAssignments);
      setPhase("reveal");
      setIsShuffling(false);
      toast({
        title: "¡Sorteo completado!",
        description: "Cada participante puede descubrir su amigo invisible.",
      });
    }, 1500);
  };

  const revealCard = (giver: string) => {
    setRevealingCard(giver);
  };

  const confirmReveal = (giver: string) => {
    setAssignments(
      assignments.map((a) =>
        a.giver === giver ? { ...a, revealed: true } : a
      )
    );
    setRevealingCard(null);
    toast({
      title: "¡Listo!",
      description: `${giver} ya sabe a quién regala.`,
    });
  };

  const closeReveal = () => {
    setRevealingCard(null);
  };

  const resetGame = () => {
    setParticipants([]);
    setAssignments([]);
    setNewName("");
    setPhase("setup");
    setRevealingCard(null);
  };

  const goBackToSetup = () => {
    setPhase("setup");
    setAssignments([]);
  };

  const allRevealed = assignments.length > 0 && assignments.every((a) => a.revealed);
  const currentRevealAssignment = assignments.find((a) => a.giver === revealingCard);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 glow-primary">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            Amigo Invisible
          </h1>
          <p className="text-muted-foreground text-lg">
            {phase === "setup"
              ? "Añade los participantes y realiza el sorteo"
              : "Cada persona pulsa su tarjeta para descubrir a quién regala"}
          </p>
        </div>

        {/* SETUP PHASE */}
        {phase === "setup" && (
          <>
            {/* Add Participant Form */}
            <div className="card-festive rounded-xl p-6 mb-8">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Añadir Participantes
              </h2>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Nombre del participante..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                  className="flex-1 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={addParticipant}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </Button>
              </div>
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="card-festive rounded-xl p-6 mb-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Participantes ({participants.length})
                </h2>
                <div className="grid gap-3">
                  {participants.map((name, index) => (
                    <div
                      key={name}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-4 border border-border/30 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-foreground font-medium text-lg">{name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipant(name)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draw Button */}
            {participants.length >= 2 && (
              <div className="flex justify-center mb-8">
                <Button
                  onClick={performDraw}
                  disabled={isShuffling}
                  className="bg-gradient-to-r from-primary to-festive-red hover:opacity-90 text-primary-foreground gap-3 text-lg px-10 py-7 glow-primary transition-all duration-300 rounded-xl"
                >
                  <Shuffle className={`w-6 h-6 ${isShuffling ? "animate-spin" : ""}`} />
                  {isShuffling ? "Sorteando..." : "¡Realizar Sorteo!"}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {participants.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center animate-float">
                  <Gift className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Añade participantes para comenzar el sorteo
                </p>
              </div>
            )}
          </>
        )}

        {/* REVEAL PHASE */}
        {phase === "reveal" && (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={goBackToSetup}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a editar participantes
              </Button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {assignments.map((assignment, index) => (
                <button
                  key={assignment.giver}
                  onClick={() => !assignment.revealed && revealCard(assignment.giver)}
                  disabled={assignment.revealed}
                  className={`relative group p-6 rounded-xl border-2 transition-all duration-300 animate-fade-in ${
                    assignment.revealed
                      ? "bg-muted/30 border-border/30 cursor-not-allowed opacity-60"
                      : "card-festive border-secondary/40 hover:border-secondary hover:glow-gold cursor-pointer hover:scale-105"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
                        assignment.revealed
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/20 text-primary group-hover:bg-primary/30"
                      }`}
                    >
                      {assignment.revealed ? (
                        <Check className="w-8 h-8" />
                      ) : (
                        assignment.giver.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span
                      className={`font-semibold text-lg ${
                        assignment.revealed ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {assignment.giver}
                    </span>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        assignment.revealed ? "text-muted-foreground" : "text-secondary"
                      }`}
                    >
                      {assignment.revealed ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Ya visto</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Pulsa para ver</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* All Revealed Message */}
            {allRevealed && (
              <div className="text-center card-festive rounded-xl p-8 glow-gold">
                <Gift className="w-16 h-16 mx-auto mb-4 text-secondary" />
                <h2 className="font-display text-2xl font-bold text-gradient-gold mb-4">
                  ¡Todos saben a quién regalan!
                </h2>
                <p className="text-muted-foreground mb-6">
                  El sorteo ha terminado. ¡A buscar los regalos!
                </p>
                <Button
                  onClick={resetGame}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Nuevo Sorteo
                </Button>
              </div>
            )}
          </>
        )}

        {/* REVEAL MODAL */}
        {revealingCard && currentRevealAssignment && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="card-festive rounded-2xl p-8 max-w-md w-full text-center glow-gold animate-scale-in"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {currentRevealAssignment.giver}
              </h2>
              <p className="text-muted-foreground mb-6">Tu amigo invisible es...</p>
              <div className="bg-muted/50 rounded-xl p-6 mb-6 border border-secondary/30">
                <p className="font-display text-4xl font-bold text-gradient-gold">
                  {currentRevealAssignment.receiver}
                </p>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                ¡Recuérdalo bien! Una vez cierres no podrás volver a verlo.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={closeReveal}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => confirmReveal(currentRevealAssignment.giver)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Check className="w-4 h-4" />
                  ¡Entendido!
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretSantaGame;
