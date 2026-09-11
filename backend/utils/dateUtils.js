const getDayName = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

module.exports = { getDayName }