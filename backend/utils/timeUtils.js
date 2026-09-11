const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours*60+minutes
}
const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes/60)
    const mins = minutes%60
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}
const addMinutesToTime = (time, duration) => {
    const totalMinutes = timeToMinutes(time)+duration
    return minutesToTime(totalMinutes)
}

module.exports = { timeToMinutes, minutesToTime, addMinutesToTime }