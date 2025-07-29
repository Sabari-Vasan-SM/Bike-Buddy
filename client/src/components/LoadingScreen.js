"use client"

function LoadingScreen({ type = "customer" }) {
  if (type === "owner") {
    return (
      <div className="loading-screen owner-loading">
        <div className="loading-container">
          <div className="owner-loading-animation">
            <div className="gear-container">
              <div className="gear gear-1">
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
              </div>
              <div className="gear gear-2">
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
                <div className="gear-tooth"></div>
              </div>
            </div>
            <div className="tools-container">
              <div className="tool wrench">🔧</div>
              <div className="tool hammer">🔨</div>
              <div className="tool screwdriver">🪛</div>
            </div>
          </div>
          <div className="loading-text">
            <h2>Setting up your workshop...</h2>
            <p>Preparing tools and services</p>
          </div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="loading-screen customer-loading">
      <div className="loading-container">
        <div className="customer-loading-animation">
          <div className="bike-container">
            <div className="bike">
              <div className="bike-frame"></div>
              <div className="wheel wheel-front">
                <div className="spoke"></div>
                <div className="spoke"></div>
                <div className="spoke"></div>
                <div className="spoke"></div>
              </div>
              <div className="wheel wheel-back">
                <div className="spoke"></div>
                <div className="spoke"></div>
                <div className="spoke"></div>
                <div className="spoke"></div>
              </div>
              <div className="pedal"></div>
            </div>
            <div className="road"></div>
          </div>
        </div>
        <div className="loading-text">
          <h2>Loading your dashboard...</h2>
          <p>Getting your bike services ready</p>
        </div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
