import * as fs from "fs"
import axios from "axios"
import { getEnvironmentData } from "worker_threads"

const SERIES_MIN : number = 5
const SERIES_MAX : number = 14
const EPISODE_MIN : number = 1
const EPISODE_MAX : number = 12

// Make data dir if it doesn't exist
fs.access(
    'data',
    (err) =>
    {
        if (err) fs.mkdir('data', (err) => { if (err) throw err } )
    }
)

for (let series = SERIES_MIN; series <= SERIES_MAX; series++)
{
    for (let episode = EPISODE_MIN; episode <= EPISODE_MAX; episode++)
    {
        let url : string = `https://wilty.fandom.com/wiki/Series_${series},_Episode_${episode}`;
        fs.access(
            `data/S${series.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}.html`,
            (err) =>
            {
                if (err) {
                    axios.get(url).then((response) =>
                        {
                            fs.writeFile(`data/S${series.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}.html`, response.data, (err) => {}) 
                        }
                    ).catch((err) => {
                        console.log(url + " : " + err.toString())
                    })  
                }
            }
        )
    }
    
}