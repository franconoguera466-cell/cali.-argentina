// App.tsx
import { useState } from "react";
import { estimateNutritionFromImage, getDailyTip } from "./services/geminiService";
import type { DetectedFood } from "./types";

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingTip, setLoadingTip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectedFood | null>(null);
  const [dailyTip, setDailyTip] = useState<string | null>(null);

  // --- helpers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setResult(null);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // nos quedamos solo con la parte base64 (después de "data:image/jpeg;base64,")
        const base64 = dataUrl.split(",")[1] ?? "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    try {
      setError(null);
      setResult(null);

      if (!imageFile) {
        setError("Subí una foto de tu comida primero.");
        return;
      }

      setLoadingAnalysis(true);
      const base64 = await fileToBase64(imageFile);

      const response = await estimateNutritionFromImage(base64);
      setResult(response);
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo analizar la imagen. Probá con otra foto o más iluminación.";
      setError(msg);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleGetDailyTip = async () => {
    try {
      setError(null);
      setLoadingTip(true);
      const tip = await getDailyTip();
      setDailyTip(tip);
    } catch (err) {
      console.error(err);
      setError("No se pudo obtener el tip del día. Probá de nuevo en un momento.");
    } finally {
      setLoadingTip(false);
    }
  };

  // --- UI ---

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "40px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#f5f5f7",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          borderRadius: "16px",
          padding: "32px 28px 40px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <header style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "28px",
              margin: 0,
              marginBottom: "4px",
              fontWeight: 700,
            }}
          >
            Cali Argentina · Analizador de platos
          </h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Subí una foto de tu comida argentina y obtené una estimación rápida de sus nutrientes.
          </p>
        </header>

        {/* Carga de imagen */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          <div>
            <label
              htmlFor="food-photo"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              1. Subí una foto del plato
            </label>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px dashed #cbd5f5",
                background:
                  "linear-gradient(135deg, rgba(219,234,254,0.5), rgba(239,246,255,0.8))",
              }}
            >
              <input
                id="food-photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ marginBottom: "10px" }}
              />
              <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
                Idealmente una foto tomada desde arriba, con buena luz, donde se vea solo el plato
                principal.
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loadingAnalysis || !imageFile}
              style={{
                marginTop: "16px",
                padding: "10px 18px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: !imageFile
                  ? "#9ca3af"
                  : loadingAnalysis
                  ? "#2563eb"
                  : "#2563eb",
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
                cursor: !imageFile ? "not-allowed" : "pointer",
                boxShadow: "0 12px 25px rgba(37,99,235,0.25)",
                opacity: loadingAnalysis ? 0.85 : 1,
                transition: "transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease",
              }}
            >
              {loadingAnalysis ? "Analizando plato..." : "Analizar nutrición"}
            </button>

            <button
              onClick={handleGetDailyTip}
              disabled={loadingTip}
              style={{
                marginTop: "10px",
                marginLeft: "8px",
                padding: "9px 14px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                color: "#111827",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {loadingTip ? "Generando tip..." : "Tip nutricional del día"}
            </button>

            {dailyTip && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#ecfeff",
                  border: "1px solid #22c1c3",
                  fontSize: "14px",
                  color: "#0f172a",
                }}
              >
                <strong>Tip del día: </strong>
                {dailyTip}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Preview + resultados */}
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              2. Resultado del análisis
            </p>

            {/* Preview de imagen */}
            <div
              style={{
                marginBottom: "12px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "8px",
                backgroundColor: "#f9fafb",
                minHeight: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview del plato"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "220px",
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                  Todavía no subiste ninguna imagen.
                </span>
              )}
            </div>

            {/* Datos nutricionales */}
            {result && (
              <div
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "14px 16px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    marginBottom: "8px",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  Plato detectado:{" "}
                  <span style={{ fontWeight: 700, color: "#111827" }}>{result.name}</span>
                </p>
                {result.portionSize && (
                  <p style={{ margin: 0, marginBottom: "8px", fontSize: "13px", color: "#4b5563" }}>
                    Tamaño de porción estimado: {result.portionSize}
                  </p>
                )}

                {result.nutrition && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <NutrientCard label="Calorías" value={result.nutrition.calories} unit="kcal" />
                    <NutrientCard label="Proteína" value={result.nutrition.protein} unit="g" />
                    <NutrientCard label="Carbohidratos" value={result.nutrition.carbs} unit="g" />
                    <NutrientCard label="Grasa" value={result.nutrition.fat} unit="g" />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

type NutrientCardProps = {
  label: string;
  value?: number;
  unit: string;
};

const NutrientCard: React.FC<NutrientCardProps> = ({ label, value, unit }) => {
  const display = typeof value === "number" ? `${value.toFixed(0)} ${unit}` : "-";

  return
  (
    <div
      style={{
        borderRadius: "10px",
        backgroundColor: "white",
        padding: "10px 12px",
        border: "1px solid #e5e7eb",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "#6b7280",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          marginTop: "4px",
          fontSize: "16px",
          fontWeight: 600,
          color: "#111827",
        }}
      >
        {display}
      </p>
    </div>
  );
};

export default App;
