import * as fs from "fs"
import cheerio from "cheerio"

class Statement
{
    panelist : string
    team : string
    assertion : string
    truthValue : boolean
    possession : boolean

    constructor(panelist : string, team : string, assertion : string, truthValue : boolean, possession : boolean)
    {
        this.panelist = panelist;
        this.team = team;
        this.assertion = assertion;
        this.truthValue = truthValue;
        this.possession = possession;
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
                regexp.lastIndex = 0;
                let match = regexp.exec(html);
                let panelist : string = match![1];
                let statement : string = match![2];
                let truthValue : string = match![4];

                const possession_regexp : RegExp = /([^\(]+) \(Possession\)/g;
                if (possession_regexp.test(panelist))
                {
                    possession_regexp.lastIndex = 0;
                    let possession_match = possession_regexp.exec(panelist);
                    panelist = possession_match![1];
                    let team : string = davidsTeam.includes(panelist) ? "David" : (leesTeam.includes(panelist) ? "Lee" : "Rob");
                    let s : Statement = new Statement (panelist, team, statement, truthValue == 'True' ? true : false, true)
                    out.push(s)
                }
                else
                {
                    let team : string = davidsTeam.includes(panelist) ? "David" : (leesTeam.includes(panelist) ? "Lee" : "Rob");
                    let s : Statement = new Statement (panelist, team, statement, truthValue == 'True' ? true : false, false)
                    out.push(s)
                }

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

