const db = {
  server: {
    list: [],
    getByHost(host) {
      return this.list.find(item => item.host === host);
    }
  }
}

module.exports = db;