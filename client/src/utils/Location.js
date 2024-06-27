class LocationClass {
  constructor(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

  equals(other) {
    if (this === other) return true;
    return this.lat === other.lat && this.lng === other.lng;
  }
}

export { LocationClass };
