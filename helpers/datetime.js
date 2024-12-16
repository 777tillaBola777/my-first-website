const getHumanReadibleDateTime = (datetime) => {

    const min = Math.ceil((new Date() - new Date(datetime)) / 1000 / 60)
    let result = ''

    const hours = min / 60
        if(min < 60){
            const plural = min > 1 ? 's' : '' 
            return `${min} minute${plural} ago`
            
        } else if(min >= 60 && min < 1440){
            if(Math.floor(hours) === 1){
                result = `${Math.floor(hours)} hour ago`
                
            } else {
                result = `${Math.floor(hours)} hours ago`
            }
            return result
        } else if(min >= 1440 && min <= 2880){
            result = 'yesterday'
            return result
        } else {
            const days = min / 1440
                result = `${Math.floor(days)} days ago`
                return result
        }


}

const makeDate = (datetime) => {
    let result = ''
    const monthNum = new Date(datetime).getMonth()
const dateNum = new Date(datetime).getDate()
const getFullYear = new Date(datetime).getFullYear()
function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber);

  return date.toLocaleString('en-US', { month: 'long' });
}
const date = getMonthName(monthNum)

const str2 = date.charAt(0).toUpperCase() + date.slice(1);
result = str2 + ' ' + dateNum + ', ' + getFullYear
return result
}

const makeDateNumber = (datetime) => {
    let result = ''
    const monthNum = new Date(datetime).getMonth()
const dateNum = new Date(datetime).getDate()
function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString('en-US', { month: 'long' });
}
const date = getMonthName(monthNum)

const str2 = date.charAt(0).toUpperCase() + date.slice(1);
result = str2 + ' ' + dateNum
return result
}

module.exports = {
    getHumanReadibleDateTime,
    makeDate,
    makeDateNumber
}