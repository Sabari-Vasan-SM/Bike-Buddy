"use client";

function LoadingScreen({ type = "customer" }) {
  return (
    <div className={`loading-screen ${type}-loading`}>
      <div className="loading-container">
        {type === "owner" ? (
          <>
            {/* Owner Loading Animation */}
            <div className="owner-loading-animation">
              <div className="tools-layout">
                <div className="tool-item tool-wrench">🔧</div>
                <div className="tool-item tool-hammer">🔨</div>
                <div className="tool-item tool-screwdriver">🪛</div>
                <div className="tool-item tool-pump">🪫</div>
              </div>

              
            </div>

            <div className="loading-text">
              <h2>Setting Up Your Workshop</h2>
              <p>Calibrating and syncing services</p>
            </div>
          </>
        ) : (
          <>
            {/* Customer Loading Animation */}
            <div className="customer-loading-animation">
              <div className="bike-scene">
                <div className="bike-wrapper">
                  <div className="bike">
                    <div className="frame triangle"></div>
                    <div className="frame top-tube"></div>
                    <div className="frame down-tube"></div>
                    <div className="frame seat-tube"></div>
                    <div className="frame chain-stay"></div>
                    <div className="frame seat-stay"></div>

                    <div className="wheel wheel-front">
                      <div className="rim"></div>
                      <div className="spoke-group">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="spoke"></div>
                        ))}
                      </div>
                      <div className="tire"></div>
                    </div>

                    <div className="wheel wheel-back">
                      <div className="rim"></div>
                      <div className="spoke-group">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="spoke"></div>
                        ))}
                      </div>
                      <div className="tire"></div>
                    </div>

                    <div className="crank"></div>
                    <div className="chain"></div>
                    <div className="handlebars"></div>
                    <div className="saddle"></div>
                  </div>
                </div>
                <div className="road"></div>
              </div>
            </div>

            <div className="loading-text">
              <h2>Loading Your Dashboard</h2>
              <p>Fetching your bike service history</p>
            </div>
          </>
        )}

        {/* Shared Loading Bar */}
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;