function pack(hour, minute) {
  const h = Number(hour);
  const m = Number(minute);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h > 23 || m > 59) return undefined;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function clock(value) {
  if (value == null || value === '' || value === 'null') return null;
  const text = String(value).trim().toLowerCase();
  const hm = text.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) return pack(hm[1], hm[2]);
  const ampm = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!ampm) return undefined;
  let h = Number(ampm[1]);
  if (ampm[3] === 'pm' && h < 12) h += 12;
  if (ampm[3] === 'am' && h === 12) h = 0;
  return pack(h, ampm[2] || '0');
}

function resolveCode(raw, stations) {
  const text = String(raw || '').trim().toLowerCase();
  if (!text) return { error: 'Name a station on this network' };
  const byCode = stations.find(s => s.code.toLowerCase() === text);
  if (byCode) return { code: byCode.code };
  const named = stations.filter(s => s.name.toLowerCase() === text);
  if (named.length === 1) return { code: named[0].code };
  if (text.length < 4) return { error: 'Name a station on this network' };
  const partial = stations.filter(s => s.name.toLowerCase().includes(text));
  if (partial.length === 1) return { code: partial[0].code };
  if (partial.length > 1) return { error: `Say which station: ${partial.map(s => s.name).join(', ')}` };
  return { error: 'Name a station on this network' };
}

function unclearStation(sentence, stations) {
  const text = String(sentence || '').toLowerCase();
  const words = text.split(/[^a-z]+/).filter(word => word.length >= 4);
  for (const word of words) {
    const hits = stations.filter(station => station.name.toLowerCase().includes(word));
    if (hits.length < 2) continue;
    if (hits.some(station => text.includes(station.name.toLowerCase()))) continue;
    return { error: `Say which station: ${hits.map(station => station.name).join(', ')}` };
  }
  return null;
}

function interpret(payload, stations) {
  if (!payload || typeof payload !== 'object') return { error: 'Could not read that sentence' };
  const from = resolveCode(payload.from, stations);
  if (from.error) return from;
  const to = resolveCode(payload.to, stations);
  if (to.error) return to;
  if (from.code === to.code) return { error: 'Source and destination cannot be same' };
  const after = clock(payload.after);
  if (after === undefined) return { error: 'Could not read the time' };
  return { from: from.code, to: to.code, after };
}

function readSentence(sentence, stations) {
  const unclear = unclearStation(sentence, stations);
  if (unclear) return unclear;
  const parts = String(sentence || '').trim().split(/\s+to\s+/i);
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
    return { error: 'Say it as Station to Station' };
  }
  let destination = parts[1].trim();
  let after = null;
  const time = destination.match(/\bafter\s+(.+)$/i);
  if (time) {
    destination = destination.slice(0, time.index).trim();
    after = time[1].trim();
  }
  return interpret({ from: parts[0].trim(), to: destination, after }, stations);
}

function filterDepartures(direct, connecting, after) {
  const leaves = (time) => !after || time >= after;
  return {
    direct: direct.filter(route => leaves(route.from.departureTime)),
    connecting: connecting.filter(route => leaves(route.train1.from.departureTime))
  };
}

module.exports = { interpret, readSentence, filterDepartures, unclearStation };
