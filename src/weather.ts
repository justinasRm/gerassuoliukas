// Weather widget for benches
// Adds a small weather forecast UI for a given bench location (lat/lon).
// Uses Open-Meteo (no API key required) to fetch current weather + hourly temps.
//
// Usage example (from client code):
//   import { addWeatherWidget } from './weather';
//   const container = document.getElementById('bench-123-meta');
//   addWeatherWidget(container, 54.6872, 25.2797);

type CurrentWeather = {
  temperature: number;
  windspeed: number;
};

type HourlyData = {
  time: string[];
  temperature_2m: number[];
  precipitation?: number[] | null;
};

type WeatherResponse = {
  current_weather?: CurrentWeather | null;
  hourly?: HourlyData | null;
};

export async function addWeatherWidget(
  container: HTMLElement | null,
  lat: number,
  lon: number
): Promise<void> {
  if (!container) return;
  const widget = document.createElement('div');
  widget.className = 'bench-weather-widget';
  widget.style.cssText = 'border:1px solid #ddd;padding:8px;border-radius:6px;margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;max-width:320px;';
  widget.innerHTML = `<strong>Weather forecast</strong>
    <div class="bw-status" style="margin-top:6px">Loading…</div>
    <div class="bw-current" style="margin-top:6px"></div>
    <button class="bw-toggle-hourly" style="margin-top:8px;display:none">Show hourly</button>
    <div class="bw-hourly" style="margin-top:8px;display:none;overflow:auto;max-height:160px;"></div>`;
  container.appendChild(widget);

  const status = widget.querySelector('.bw-status') as HTMLElement;
  const current = widget.querySelector('.bw-current') as HTMLElement;
  const toggleBtn = widget.querySelector('.bw-toggle-hourly') as HTMLButtonElement;
  const hourlyBox = widget.querySelector('.bw-hourly') as HTMLElement;

  try {
    // Open-Meteo: current weather + hourly temperature for 24h
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current_weather: 'true',
      hourly: 'temperature_2m,precipitation',
      timezone: 'auto',
      forecast_days: '1',
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: WeatherResponse = await res.json();

    status.textContent = ''; // clear loading

    // Show current weather
    if (data.current_weather) {
      const cw = data.current_weather;
      const temp = cw.temperature;
      const wind = cw.windspeed;
      current.textContent = `Now: ${temp}°C · Wind ${wind} m/s`;
    } else {
      current.textContent = 'No current weather available.';
    }

    // Build a short hourly overview
    if (data.hourly?.time && data.hourly.temperature_2m) {
      const times = data.hourly.time;
      const temps = data.hourly.temperature_2m;
      // Show next 8 values as inline chips
      const chips = document.createElement('div');
      chips.style.display = 'flex';
      chips.style.gap = '6px';
      chips.style.flexWrap = 'wrap';
      const nowIndex = 0; // times are local tz starting at midnight; we keep the first 8 for quick glance
      const take = Math.min(8, temps.length, times.length);
      const frag = document.createDocumentFragment();
      for (let i = nowIndex; i < nowIndex + take; i++) {
        const hour = times[i];
        const tempVal = temps[i];
        if (hour === undefined || tempVal === undefined) continue;
        const c = document.createElement('div');
        c.style.padding = '4px 6px';
        c.style.border = '1px solid #eee';
        c.style.borderRadius = '4px';
        c.style.background = '#fafafa';
        c.textContent = `${formatHour(hour)}: ${Math.round(tempVal)}°C`;
        frag.appendChild(c);
      }
      chips.appendChild(frag);
      current.appendChild(chips);

      // Prepare hourly table for toggle
      toggleBtn.style.display = 'inline-block';
      let expanded = false;
      const setExpanded = (vis: boolean) => {
        expanded = vis;
        hourlyBox.style.display = vis ? 'block' : 'none';
        toggleBtn.textContent = vis ? 'Hide hourly' : 'Show hourly';
      };
      toggleBtn.addEventListener('click', () => setExpanded(!expanded));

      hourlyBox.innerHTML = buildHourlyTable(times, temps, data.hourly?.precipitation ?? null);
    } else {
      toggleBtn.style.display = 'none';
    }
  } catch (err) {
    console.error('Weather widget error', err);
    status.textContent = 'Failed to load weather.';
  }
}

function formatHour(isoTime: string): string {
  // isoTime like "2025-10-19T14:00"
  try {
    const d = new Date(isoTime);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  } catch {
    return isoTime;
  }
}

function buildHourlyTable(
  times: string[],
  temps: number[],
  precipitation?: number[] | null
): string {
  let html = '<table style="width:100%;border-collapse:collapse;font-size:13px">';
  html += '<thead><tr><th style="text-align:left;padding:6px;border-bottom:1px solid #eee">Time</th><th style="text-align:right;padding:6px;border-bottom:1px solid #eee">Temp</th><th style="text-align:right;padding:6px;border-bottom:1px solid #eee">Precip</th></tr></thead><tbody>';
  const len = Math.min(times.length, temps.length);
  for (let i = 0; i < len; i++) {
    const hour = times[i];
    const tempVal = temps[i];
    if (hour === undefined || tempVal === undefined) continue;
    const t = Math.round(tempVal);
    const precipVal = precipitation?.[i];
    const p = typeof precipVal === 'number' ? `${precipVal.toFixed(1)}mm` : '-';
    html += `<tr><td style="padding:6px;border-bottom:1px solid #fafafa">${formatHour(hour)}</td><td style="padding:6px;text-align:right;border-bottom:1px solid #fafafa">${t}°C</td><td style="padding:6px;text-align:right;border-bottom:1px solid #fafafa">${p}</td></tr>`;
  }
  html += '</tbody></table>';
  return html;
}
