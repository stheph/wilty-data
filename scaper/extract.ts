import * as fs from "fs"
import cheerio from "cheerio"

class Statement
{
    panelist : string
    team : string
    assertion : string
    truthValue : boolean
    possession : boolean

    constructor(panelist : string, team : string, assertion : string, truthValue : boolean)
    {
        this.team = team
        this.assertion = assertion;
        this.truthValue = truthValue;
        const regexp : RegExp = /([^\(]+) \(Possession\)/g
        if (regexp.test(panelist))
        {
            regexp.lastIndex = 0;
            let match = regexp.exec(panelist);
            this.panelist = match![1];
            this.possession = true;
        }
        else
        {
            this.panelist = panelist;
            this.possession = false;
        }
    }
}

function getTeams ($: cheerio.Root, teamCaptain : string) : string[]
{
    let out : string[] = teamCaptain == "David" ? ['David Mitchell'] : ['Lee Mack'];
    $("tbody tr").each((_ : number, e : cheerio.Element) =>
        {
            if ($("td b", e).text() == `${teamCaptain}'s guests`)
            {
                $("td span", e).each((_ : number, ee : cheerio.Element) => out.push($(ee).text()));
            }
        }
    )
    return out;
}

function getStatements ($: cheerio.Root, davidsTeam : string[], leesTeam : string[]) : Statement[]
{
    let out : Statement[] = [];
    $("li").each(
        (_ :number, e : cheerio.Element) =>
        {
            let html : string | null = $(e).html()!;
            const regexp : RegExp = /^\<b\>([^:]+):\<\/b\> ([^\<]+) – \<font color=\"(green|red)\"\>(True|Lie)\<\/font\>/g;
            if (regexp.test(html))
            {
                regexp.lastIndex = 0
                let match = regexp.exec(html)
                let team : string = davidsTeam.includes(match![1]) ? "David" : (leesTeam.includes(match![1]) ? "Lee" : "Rob");
                let s : Statement = new Statement (match![1], team, match![2], match![4] == 'True' ? true : false)
                out.push(s)
            }
        }
    )
    return out;
}

let html = ''
fs.readFile('test.html', (err, data) => { 
    html = data.toString();
    const $ = cheerio.load(html)
    let davidsTeam : string[] = getTeams($, "David")
    let leesTeam : string[] = getTeams($, "Lee")
    console.log(davidsTeam)
    console.log(leesTeam)
    console.log(getStatements($, davidsTeam, leesTeam))
})

