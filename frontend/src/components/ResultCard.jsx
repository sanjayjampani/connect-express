import { useState } from 'react'

function ResultCard({ route, getStationName }) {
  const [copied, setCopied] = useState(false)

  const copyRouteDetails = () => {
    let text = ''
    
    if (route.type === 'direct') {
      text = `🚂 Direct Train
━━━━━━━━━━━━━━━━━━━━
📍 ${getStationName(route.from.stationCode)} (${route.from.stationCode})
   Departure: ${route.from.departureTime}

🚆 Train: ${route.trainNumber} - ${route.trainName}
⏱️ Duration: ${route.durationFormatted}

📍 ${getStationName(route.to.stationCode)} (${route.to.stationCode})
   Arrival: ${route.to.arrivalTime}
━━━━━━━━━━━━━━━━━━━━
via Connect Express 🚄`
    } else {
      text = `🚂 Connecting Route
━━━━━━━━━━━━━━━━━━━━
📍 ${getStationName(route.train1.from.stationCode)} (${route.train1.from.stationCode})
   Departure: ${route.train1.from.departureTime}

🚆 Train 1: ${route.train1.trainNumber} - ${route.train1.trainName}
⏱️ Duration: ${route.train1.durationFormatted}

🔄 Change at ${getStationName(route.connectionStation)}
   Layover: ${route.layoverFormatted}

🚆 Train 2: ${route.train2.trainNumber} - ${route.train2.trainName}
⏱️ Duration: ${route.train2.durationFormatted}

📍 ${getStationName(route.train2.to.stationCode)} (${route.train2.to.stationCode})
   Arrival: ${route.train2.to.arrivalTime}

⏱️ Total Duration: ${route.totalDurationFormatted}
━━━━━━━━━━━━━━━━━━━━
via Connect Express 🚄`
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (route.type === 'direct') {
    return (
      <div className="result-card">
        <div className="card-header">
          <span className="train-badge direct">✓ Direct</span>
          <div className="card-actions">
            <span className="duration-badge">{route.durationFormatted}</span>
            <button 
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyRouteDetails}
              title="Copy route details"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        <div className="journey-preview">
          <div className="journey-leg">
            <div className="station-node"></div>
            <div className="station-info">
              <div className="station-main">
                <span className="station-code">{route.from.stationCode}</span>
                <span className="station-name">{getStationName(route.from.stationCode)}</span>
              </div>
              <span className="station-time">{route.from.departureTime}</span>
            </div>

            <div className="train-link">
              <div className="train-meta">
                <span className="train-number">{route.trainNumber}</span>
                <span className="train-name">{route.trainName}</span>
              </div>
              <span className="leg-duration">{route.durationFormatted}</span>
            </div>
          </div>

          <div className="journey-leg">
            <div className="station-node"></div>
            <div className="station-info">
              <div className="station-main">
                <span className="station-code">{route.to.stationCode}</span>
                <span className="station-name">{getStationName(route.to.stationCode)}</span>
              </div>
              <span className="station-time">{route.to.arrivalTime}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connecting Route
  return (
    <div className="result-card">
      <div className="card-header">
        <span className="train-badge connecting">↔ Connecting via {route.connectionStation}</span>
        <div className="card-actions">
          <span className="duration-badge">{route.totalDurationFormatted}</span>
          <button 
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={copyRouteDetails}
            title="Copy route details"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      <div className="journey-preview">
        {/* Leg 1 */}
        <div className="journey-leg">
          <div className="station-node"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.train1.from.stationCode}</span>
              <span className="station-name">{getStationName(route.train1.from.stationCode)}</span>
            </div>
            <span className="station-time">{route.train1.from.departureTime}</span>
          </div>

          <div className="train-link">
            <div className="train-meta">
              <span className="train-number">{route.train1.trainNumber}</span>
              <span className="train-name">{route.train1.trainName}</span>
            </div>
            <span className="leg-duration">{route.train1.durationFormatted}</span>
          </div>
        </div>

        {/* Layover */}
        <div className="journey-leg">
          <div className="station-node connection"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.connectionStation}</span>
              <span className="station-name">{getStationName(route.connectionStation)}</span>
            </div>
            <span className="station-time">{route.train1.to.arrivalTime}</span>
          </div>

          <div className="layover-pill">
            <span className="layover-text">Wait at {getStationName(route.connectionStation)}</span>
            <span className="layover-duration">{route.layoverFormatted}</span>
          </div>
        </div>

        {/* Leg 2 */}
        <div className="journey-leg">
          <div className="station-node connection"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.connectionStation}</span>
              <span className="station-name">{getStationName(route.connectionStation)}</span>
            </div>
            <span className="station-time">{route.train2.from.departureTime}</span>
          </div>

          <div className="train-link connecting">
            <div className="train-meta">
              <span className="train-number">{route.train2.trainNumber}</span>
              <span className="train-name">{route.train2.trainName}</span>
            </div>
            <span className="leg-duration">{route.train2.durationFormatted}</span>
          </div>
        </div>

        {/* Destination */}
        <div className="journey-leg">
          <div className="station-node"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.train2.to.stationCode}</span>
              <span className="station-name">{getStationName(route.train2.to.stationCode)}</span>
            </div>
            <span className="station-time">{route.train2.to.arrivalTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
