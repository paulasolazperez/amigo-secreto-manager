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
    <div className="min-h-screen bg-background py-8 px-4 relative overflow-hidden font-poppins">
      <Snowflakes />
      
      {/* Decorative Elements */}
      <div className="fixed top-10 left-10 text-accent opacity-20 animate-pulse-glow">
        <TreePine className="w-16 h-16" />
      </div>
      <div className="fixed top-20 right-10 text-secondary opacity-30 animate-twinkle">
        <Star className="w-10 h-10" />
      </div>
      <div className="fixed bottom-20 left-20 text-primary opacity-20 animate-pulse-glow">
        <Gift className="w-12 h-12" />
      </div>
      <div className="fixed bottom-10 right-20 text-accent opacity-20 animate-twinkle" style={{ animationDelay: "1s" }}>
        <Star className="w-8 h-8" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mb-6 glow-primary border-2 border-secondary/30">
            <Gift className="w-12 h-12 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-christmas mb-4">
            🎄 Amigo Invisible 🎄
          </h1>
          <p className="text-muted-foreground text-lg">
            {phase === "setup"
              ? "Añade los participantes y realiza el sorteo navideño"
              : "Cada persona pulsa su tarjeta para descubrir a quién regala"}
          </p>
        </div>

        {/* SETUP PHASE */}
        {phase === "setup" && (
          <>
            {/* Add Participant Form */}
            <div className="card-christmas rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Añadir Participantes
              </h2>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Nombre del participante..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                  className="flex-1 bg-muted border-accent/30 text-foreground placeholder:text-muted-foreground focus:border-accent"
                />
                <Button
                  onClick={addParticipant}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </Button>
              </div>
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="card-christmas rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Participantes ({participants.length})
                </h2>
                <div className="grid gap-3">
                  {participants.map((name, index) => (
                    <div
                      key={name}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-4 border border-accent/20 animate-fade-in hover:border-accent/40 transition-colors"
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
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-secondary font-bold text-lg border border-secondary/30">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-foreground font-medium text-lg">{name}</span>
                          </div>
                          <div className="flex items-center gap-1">
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
              <div className="flex justify-center mb-8">
                <Button
                  onClick={performDraw}
                  disabled={isShuffling}
                  className="bg-gradient-to-r from-primary via-christmas-red to-primary hover:opacity-90 text-primary-foreground gap-3 text-lg px-10 py-7 glow-primary transition-all duration-300 rounded-xl border-2 border-secondary/30"
                >
                  <Shuffle className={`w-6 h-6 ${isShuffling ? "animate-spin" : ""}`} />
                  {isShuffling ? "Sorteando..." : "🎅 ¡Realizar Sorteo!"}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {participants.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center animate-float border-2 border-accent/20">
                  <TreePine className="w-12 h-12 text-accent" />
                </div>
                <p className="text-muted-foreground text-lg">
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
                      : "card-christmas border-accent/40 hover:border-secondary hover:glow-gold cursor-pointer hover:scale-105"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {!assignment.revealed && (
                    <div className="absolute -top-2 -right-2 text-secondary animate-twinkle">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors border-2 ${
                        assignment.revealed
                          ? "bg-muted text-muted-foreground border-border"
                          : "bg-gradient-to-br from-primary/30 to-accent/30 text-secondary border-secondary/30 group-hover:from-primary/40 group-hover:to-accent/40"
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
                        assignment.revealed ? "text-muted-foreground" : "text-accent"
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
              <div className="text-center card-christmas rounded-xl p-8 glow-gold border-2 border-secondary/30">
                <div className="flex justify-center gap-2 mb-4">
                  <TreePine className="w-10 h-10 text-accent" />
                  <Gift className="w-10 h-10 text-primary" />
                  <TreePine className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-gradient-gold mb-4">
                  🎁 ¡Todos saben a quién regalan! 🎁
                </h2>
                <p className="text-muted-foreground mb-6">
                  El sorteo ha terminado. ¡Feliz Navidad y a buscar los regalos!
                </p>
                <Button
                  onClick={resetGame}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
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
            <div className="card-christmas rounded-2xl p-8 max-w-md w-full text-center glow-gold animate-scale-in border-2 border-secondary/50">
              <div className="flex justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-secondary animate-twinkle" />
                <Star className="w-8 h-8 text-secondary animate-twinkle" style={{ animationDelay: "0.5s" }} />
                <Star className="w-6 h-6 text-secondary animate-twinkle" style={{ animationDelay: "1s" }} />
              </div>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-secondary/30">
                <Gift className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentRevealAssignment.giver}
              </h2>
              <p className="text-muted-foreground mb-6">Tu amigo invisible es...</p>
              <div className="bg-muted/50 rounded-xl p-6 mb-6 border-2 border-secondary/30 glow-gold">
                <p className="text-4xl font-bold text-gradient-gold">
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
