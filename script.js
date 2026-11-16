const map = L.map("map").setView([12.8797, 121.774], 6);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

// Get HTML elements
const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");
const message = document.getElementById("message");

input.addEventListener("input", () => {
    if (input.value.trim() === "") {
        markerLayer.clearLayers();
        message.textContent = "";
        map.setView([12.8797, 121.774], 6);
    }
});


form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = input.value.trim();

  if (city.length < 2) {
    message.textContent = "Please enter a valid city name.";
    return;
  }

  markerLayer.clearLayers();

  message.textContent = "Searching for locations...";

  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?" +
      new URLSearchParams({
        name: city,
        count: "5",
        language: "en",
        format: "json",
        countryCode: "PH",
      });


    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch locations.");
    }

    const data = await response.json();

    const locations = (data.results ?? [])
      .filter(place => place.country_code === "PH")
      .slice(0, 5);

    if (locations.length === 0) {
      message.textContent =
        "No matching Philippine cities found. Try another city.";
      return;
    }

    const bounds = [];

    locations.forEach((place) => {
      const coords = [place.latitude, place.longitude];

      bounds.push(coords);

      const marker = L.marker(coords).addTo(markerLayer);

      const popupContent = document.createElement("div");
      const placeName = document.createElement("strong");
      const countryName = document.createElement("p");

      placeName.textContent = place.name;
      countryName.textContent = place.country;

      popupContent.appendChild(placeName);
      popupContent.appendChild(countryName);

      marker.bindPopup(popupContent);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    } else {
      map.fitBounds(bounds, { padding: [35, 35] });
    }

    message.textContent =
      `Found ${locations.length} matching location(s) in the Philippines.`;

  } catch (error) {
    console.error(error);

    message.textContent =
      "Something went wrong. Please check your internet connection and try again.";
  }
});
