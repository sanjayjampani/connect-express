import { useState } from 'react'

function at(time, day) {
  return day > 1 ? `${time} +${day - 1}` : time
}

function whyLine(route) {
  if (route.type === 'direct') {
    return `Train ${route.trainNumber} departs ${route.from.stationCode} at ${route.from.departureTime} and arrives at ${route.to.stationCode} at ${route.to.arrivalTime}.`
  }
  return `Take train ${route.train1.trainNumber} from ${route.train1.from.stationCode} at ${route.train1.from.departureTime}, arriving at ${route.connectionStation} at ${route.train1.to.arrivalTime}, wait ${route.layoverFormatted}, then take train ${route.train2.trainNumber} at ${route.train2.from.departureTime} to ${route.train2.to.stationCode}, arriving at ${route.train2.to.arrivalTime}.`
}

function ResultCard({ route, getStationName, saved, onToggleSave }) {
  const [copied, setCopied] = useState(false)
  const [why, setWhy] = useState('')

  const whyBlock = (
    <div className="why-block">
      <button type="button" className="why-btn" onClick={() => setWhy(why ? '' : whyLine(route))}>
        Why this trip?
      </button>
      {why && <p className="why-line">{why}</p>}
    </div>
  )

  const copyRouteDetails = () => {
    let text = ''
    
    if (route.type === 'direct') {
      text = `🚂 Direct Train
━━━━━━━━━━━━━━━━━━━━
📍 ${getStationName(route.from.stationCode)} (${route.from.stationCode})
   Departure: ${at(route.from.departureTime, route.from.day)}

🚆 Train: ${route.trainNumber} - ${route.trainName}
⏱️ Duration: ${route.durationFormatted}

📍 ${getStationName(route.to.stationCode)} (${route.to.stationCode})
   Arrival: ${at(route.to.arrivalTime, route.to.day)}
━━━━━━━━━━━━━━━━━━━━
via Connect Express 🚄`
    } else {
      text = `🚂 Connecting Route
━━━━━━━━━━━━━━━━━━━━
📍 ${getStationName(route.train1.from.stationCode)} (${route.train1.from.stationCode})
   Departure: ${at(route.train1.from.departureTime, route.train1.from.day)}

🚆 Train 1: ${route.train1.trainNumber} - ${route.train1.trainName}
⏱️ Duration: ${route.train1.durationFormatted}

🔄 Change at ${getStationName(route.connectionStation)}
   Layover: ${route.layoverFormatted}

🚆 Train 2: ${route.train2.trainNumber} - ${route.train2.trainName}
⏱️ Duration: ${route.train2.durationFormatted}

📍 ${getStationName(route.train2.to.stationCode)} (${route.train2.to.stationCode})
   Arrival: ${at(route.train2.to.arrivalTime, route.train2.to.day)}

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
              type="button"
              className={`copy-btn${saved ? ' saved' : ''}`}
              onClick={() => onToggleSave(route)}
              title={saved ? 'Remove saved trip' : 'Save trip'}
            >
              {saved ? '★' : '☆'}
            </button>
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
              <span className="station-time">{at(route.from.departureTime, route.from.day)}</span>
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
              <span className="station-time">{at(route.to.arrivalTime, route.to.day)}</span>
            </div>
          </div>
        </div>
        {whyBlock}
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
            type="button"
            className={`copy-btn${saved ? ' saved' : ''}`}
            onClick={() => onToggleSave(route)}
            title={saved ? 'Remove saved trip' : 'Save trip'}
          >
            {saved ? '★' : '☆'}
          </button>
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
            <span className="station-time">{at(route.train1.from.departureTime, route.train1.from.day)}</span>
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
            <span className="station-time">{at(route.train1.to.arrivalTime, route.train1.to.day)}</span>
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
            <span className="station-time">{at(route.train2.from.departureTime, route.train2.from.day)}</span>
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
            <span className="station-time">{at(route.train2.to.arrivalTime, route.train2.to.day)}</span>
          </div>
        </div>
        {whyBlock}
      </div>
    </div>
  )
}

export default ResultCard
