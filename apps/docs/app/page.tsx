export default function Page() {
  return (
    <main style={{ 
      padding: "2rem", 
      fontFamily: "Inter, system-ui, sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      lineHeight: 1.7
    }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: 700, 
          color: "#1e293b",
          margin: 0 
        }}>
          Welcome to Vanashree Repository
        </h1>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#64748b", 
          marginTop: "1rem"
        }}>
          A Turborepo monorepo with web app + docs
        </p>
      </div>

      <div style={{ 
        background: "white", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px -1px rgba(0, 0,0, 0.1)",
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1e293b" }}>
          🏗️ Project Structure
        </h2>
        <div style={{ display: "grid", gap: "1rem", fontSize: "1rem" }}>
          <div>
            <code style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
              apps/web/
            </code> 
            <span>→ Main app (</span>
            <strong style={{ color: "#059669" }}>localhost:3000</strong>
            <span>)</span>
          </div>
          <div>
            <code style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
              apps/docs/
            </code> 
            <span>→ Documentation (</span>
            <strong style={{ color: "#059669" }}>localhost:3001</strong>
            <span>)</span>
          </div>
          <div>
            <code style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
              packages/ui/
            </code> 
            <span>→ Shared UI components</span>
          </div>
        </div>
      </div>

      <div style={{ 
        background: "#f8fafc", 
        borderRadius: "12px", 
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1e293b" }}>
          ⚡ Turbo Commands
        </h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <code style={{ 
              background: "#1e293b", 
              color: "white", 
              padding: "0.5rem 1rem", 
              borderRadius: "6px",
              fontFamily: "monospace",
              minWidth: "120px"
            }}>
              turbo dev
            </code>
            <span>→ Start web (3000) + docs (3001)</span>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <code style={{ 
              background: "#1e293b", 
              color: "white", 
              padding: "0.5rem 1rem", 
              borderRadius: "6px",
              fontFamily: "monospace",
              minWidth: "120px"
            }}>
              turbo build
            </code>
            <span>→ Build all apps for production</span>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <code style={{ 
              background: "#1e293b", 
              color: "white", 
              padding: "0.5rem 1rem", 
              borderRadius: "6px",
              fontFamily: "monospace",
              minWidth: "120px"
            }}>
              turbo lint
            </code>
            <span>→ Check code quality everywhere</span>
          </div>
        </div>
      </div>

      <div style={{ 
        padding: "2rem", 
        background: "#fef3c7", 
        border: "1px solid #f59e0b",
        borderRadius: "12px",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#92400e", marginBottom: "1rem" }}>
          🎯 Quick Start
        </h2>
        <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>
          Run <code style={{ background: "#1e293b", color: "white", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>turbo dev</code> 
          and visit both ports!
        </p>
      </div>
    </main>
  );
}
