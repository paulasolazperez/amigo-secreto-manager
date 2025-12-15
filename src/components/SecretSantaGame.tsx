import { useState } from "react";
import { Gift, Users, Shuffle, Trash2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Assignment {
  giver: string;
  receiver: string;
}

const SecretSantaGame = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

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
    setAssignments([]);
    toast({
      title: "¡Participante añadido!",
      description: `${trimmedName} se ha unido al juego.`,
    });
  };

  const removeParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
    setAssignments([]);
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
      
      // Ensure no one gets themselves
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
      }));

      setAssignments(newAssignments);
      setIsShuffling(false);
      toast({
        title: "¡Sorteo completado!",
        description: "Los amigos invisibles han sido asignados.",
      });
    }, 1500);
  };

  const resetGame = () => {
    setParticipants([]);
    setAssignments([]);
    setNewName("");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 glow-primary">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            Amigo Invisible
          </h1>
          <p className="text-muted-foreground text-lg">
            Organiza tu sorteo de regalos de forma mágica
          </p>
        </div>

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
                  className={`flex items-center justify-between bg-muted/50 rounded-lg p-4 border border-border/30 animate-fade-in ${
                    isShuffling ? "animate-shuffle" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-foreground font-medium">{name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParticipant(name)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={assignments.length > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {participants.length >= 2 && assignments.length === 0 && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={performDraw}
              disabled={isShuffling}
              className="bg-gradient-to-r from-primary to-festive-red hover:opacity-90 text-primary-foreground gap-3 text-lg px-8 py-6 glow-primary transition-all duration-300"
            >
              <Shuffle className={`w-5 h-5 ${isShuffling ? "animate-spin" : ""}`} />
              {isShuffling ? "Sorteando..." : "¡Realizar Sorteo!"}
            </Button>
          </div>
        )}

        {/* Results */}
        {assignments.length > 0 && (
          <div className="card-festive rounded-xl p-6 mb-8 glow-gold">
            <h2 className="font-display text-2xl font-bold text-gradient-gold mb-6 text-center flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-secondary" />
              ¡Resultados del Sorteo!
            </h2>
            <div className="grid gap-4">
              {assignments.map((assignment, index) => (
                <div
                  key={assignment.giver}
                  className="flex items-center justify-between bg-muted/30 rounded-lg p-4 border border-secondary/30 animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold">
                      {assignment.giver.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-foreground font-semibold">{assignment.giver}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary">
                    <Gift className="w-5 h-5" />
                    <span className="text-muted-foreground">regala a</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent font-semibold">{assignment.receiver}</span>
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-accent font-bold">
                      {assignment.receiver.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                onClick={resetGame}
                variant="outline"
                className="border-secondary/50 text-secondary hover:bg-secondary/10 gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Nuevo Sorteo
              </Button>
            </div>
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
      </div>
    </div>
  );
};

export default SecretSantaGame;
