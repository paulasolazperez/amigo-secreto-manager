import { useState, useEffect } from "react";
import { Gift, Users, Shuffle, Trash2, Plus, Sparkles, ArrowLeft, Eye, EyeOff, Check, TreePine, Star, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Assignment {
  giver: string;
  receiver: string;
  revealed: boolean;
}

type GamePhase = "setup" | "reveal";

const Snowflakes = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const flakes = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        >
          ❄
        </div>
      ))}
    </>
  );
};

const SecretSantaGame = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealingCard, setRevealingCard] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");

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

  const startEditing = (name: string) => {
    setEditingName(name);
    setEditedValue(name);
  };

  const cancelEditing = () => {
    setEditingName(null);
    setEditedValue("");
  };

  const saveEdit = () => {
    const trimmedValue = editedValue.trim();
    if (!trimmedValue) {
      toast({
        title: "Nombre vacío",
        description: "Por favor, introduce un nombre válido.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedValue !== editingName && participants.includes(trimmedValue)) {
      toast({
        title: "Nombre duplicado",
        description: "Este participante ya está en la lista.",
        variant: "destructive",
      });
      return;
    }
    setParticipants(
      participants.map((p) => (p === editingName ? trimmedValue : p))
    );
    setEditingName(null);
    setEditedValue("");
    toast({
      title: "✏️ Nombre actualizado",
      description: `El nombre ha sido cambiado a ${trimmedValue}.`,
    });
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
        title: "🎄 ¡Sorteo completado!",
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
      title: "🎁 ¡Listo!",
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
    <div className="min-h-screen bg-background py-6 px-3 sm:py-8 sm:px-4 relative overflow-hidden font-poppins">
      <Snowflakes />
      
      {/* Decorative Elements - Hidden on mobile for cleaner look */}
      <div className="hidden sm:block fixed top-10 left-10 text-accent opacity-20 animate-pulse-glow">
        <TreePine className="w-16 h-16" />
      </div>
      <div className="hidden sm:block fixed top-20 right-10 text-secondary opacity-30 animate-twinkle">
        <Star className="w-10 h-10" />
      </div>
      <div className="hidden sm:block fixed bottom-20 left-20 text-primary opacity-20 animate-pulse-glow">
        <Gift className="w-12 h-12" />
      </div>
      <div className="hidden sm:block fixed bottom-10 right-20 text-accent opacity-20 animate-twinkle" style={{ animationDelay: "1s" }}>
        <Star className="w-8 h-8" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mb-4 sm:mb-6 glow-primary border-2 border-secondary/30">
            <Gift className="w-8 h-8 sm:w-12 sm:h-12 text-secondary" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gradient-christmas mb-2 sm:mb-4">
            🎄 Amigo Invisible 🎄
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg px-2">
            {phase === "setup"
              ? "Añade los participantes y realiza el sorteo"
              : "Pulsa tu tarjeta para ver a quién regalas"}
          </p>
        </div>

        {/* SETUP PHASE */}
        {phase === "setup" && (
          <>
            {/* Add Participant Form */}
            <div className="card-christmas rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Añadir Participantes
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Input
                  type="text"
                  placeholder="Nombre del participante..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                  className="flex-1 bg-muted border-accent/30 text-foreground placeholder:text-muted-foreground focus:border-accent h-12"
                />
                <Button
                  onClick={addParticipant}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 h-12 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </Button>
              </div>
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="card-christmas rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Participantes ({participants.length})
                </h2>
                <div className="grid gap-2 sm:gap-3">
                  {participants.map((name, index) => (
                    <div
                      key={name}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3 sm:p-4 border border-accent/20 animate-fade-in hover:border-accent/40 transition-colors"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {editingName === name ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="text"
                            value={editedValue}
                            onChange={(e) => setEditedValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                            className="flex-1 bg-muted border-accent/30 text-foreground"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            onClick={saveEdit}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-secondary font-bold text-sm sm:text-lg border border-secondary/30 flex-shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-foreground font-medium text-base sm:text-lg truncate">{name}</span>
                          </div>
                          <div className="flex items-center gap-0 sm:gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(name)}
                              className="text-muted-foreground hover:text-secondary hover:bg-secondary/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeParticipant(name)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draw Button */}
            {participants.length >= 2 && (
              <div className="flex justify-center mb-6 sm:mb-8 px-2">
                <Button
                  onClick={performDraw}
                  disabled={isShuffling}
                  className="bg-gradient-to-r from-primary via-christmas-red to-primary hover:opacity-90 text-primary-foreground gap-2 sm:gap-3 text-base sm:text-lg px-6 sm:px-10 py-6 sm:py-7 glow-primary transition-all duration-300 rounded-xl border-2 border-secondary/30 w-full sm:w-auto"
                >
                  <Shuffle className={`w-5 h-5 sm:w-6 sm:h-6 ${isShuffling ? "animate-spin" : ""}`} />
                  {isShuffling ? "Sorteando..." : "🎅 ¡Realizar Sorteo!"}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {participants.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-muted/50 flex items-center justify-center animate-float border-2 border-accent/20">
                  <TreePine className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                </div>
                <p className="text-muted-foreground text-base sm:text-lg px-4">
                  Añade participantes para comenzar el sorteo navideño
                </p>
              </div>
            )}
          </>
        )}

        {/* REVEAL PHASE */}
        {phase === "reveal" && (
          <>
            {/* Back Button */}
            <div className="mb-4 sm:mb-6">
              <Button
                variant="ghost"
                onClick={goBackToSetup}
                className="text-muted-foreground hover:text-foreground gap-2 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver a editar participantes</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {assignments.map((assignment, index) => (
                <button
                  key={assignment.giver}
                  onClick={() => !assignment.revealed && revealCard(assignment.giver)}
                  disabled={assignment.revealed}
                  className={`relative group p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 animate-fade-in ${
                    assignment.revealed
                      ? "bg-muted/30 border-border/30 cursor-not-allowed opacity-60"
                      : "card-christmas border-accent/40 hover:border-secondary hover:glow-gold cursor-pointer active:scale-95 sm:hover:scale-105"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {!assignment.revealed && (
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 text-secondary animate-twinkle">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2 sm:gap-4">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors border-2 ${
                        assignment.revealed
                          ? "bg-muted text-muted-foreground border-border"
                          : "bg-gradient-to-br from-primary/30 to-accent/30 text-secondary border-secondary/30 group-hover:from-primary/40 group-hover:to-accent/40"
                      }`}
                    >
                      {assignment.revealed ? (
                        <Check className="w-6 h-6 sm:w-8 sm:h-8" />
                      ) : (
                        assignment.giver.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span
                      className={`font-semibold text-sm sm:text-lg text-center truncate w-full ${
                        assignment.revealed ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {assignment.giver}
                    </span>
                    <div
                      className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                        assignment.revealed ? "text-muted-foreground" : "text-accent"
                      }`}
                    >
                      {assignment.revealed ? (
                        <>
                          <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Ya visto</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
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
              <div className="text-center card-christmas rounded-xl p-6 sm:p-8 glow-gold border-2 border-secondary/30">
                <div className="flex justify-center gap-2 mb-3 sm:mb-4">
                  <TreePine className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                  <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  <TreePine className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gradient-gold mb-3 sm:mb-4">
                  ¡Todos saben a quién regalan!
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                  El sorteo ha terminado. ¡Feliz Navidad!
                </p>
                <Button
                  onClick={resetGame}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 w-full sm:w-auto"
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
          <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-christmas rounded-2xl p-6 sm:p-8 max-w-md w-full text-center glow-gold animate-scale-in border-2 border-secondary/50">
              <div className="flex justify-center gap-2 mb-3 sm:mb-4">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-secondary animate-twinkle" />
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-secondary animate-twinkle" style={{ animationDelay: "0.5s" }} />
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-secondary animate-twinkle" style={{ animationDelay: "1s" }} />
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-secondary/30">
                <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {currentRevealAssignment.giver}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">Tu amigo invisible es...</p>
              <div className="bg-muted/50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-secondary/30 glow-gold">
                <p className="text-2xl sm:text-4xl font-bold text-gradient-gold">
                  {currentRevealAssignment.receiver}
                </p>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
                ¡Recuérdalo bien! Una vez cierres no podrás volver a verlo.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={closeReveal}
                  className="border-border text-muted-foreground hover:bg-muted order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => confirmReveal(currentRevealAssignment.giver)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 order-1 sm:order-2"
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
