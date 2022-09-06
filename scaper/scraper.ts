import axios from "axios"
import fs from "fs"

const SERIES_MIN : number = 5
const SERIES_MAX : number = 5
// const SERIES_MAX : number = 14
const EPISODE_MIN : number = 1
const EPISODE_MAX : number = 1
// const EPISODE_MAX : number = 10

for (let series = SERIES_MIN; series <= SERIES_MAX; series++)
{
    for (let episode = EPISODE_MIN; episode <= EPISODE_MAX; episode++)
    {
        let url : string = `https://wilty.fandom.com/wiki/Series_${series},_Episode_${episode}`;
        console.log(url)

        const AxiosInstance = axios.create();

        AxiosInstance.get(url).then(
            response => {
                const html = response.data;
                fs.writeFile('test.html', html, (err) => {})
            }
        )
    }
}