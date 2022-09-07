import * as fs from "fs"
import cheerio from "cheerio"

class Statement
{
    panelist : string
    team : string
    assertion : string
    possession : boolean
    truthValue : boolean

    constructor(panelist : string, team : string, assertion : string, possession : boolean, truthValue : boolean)
    {
        this.panelist = panelist;
        this.team = team;
        this.assertion = assertion;
        this.possession = possession;
        this.truthValue = truthValue;
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
            // Remove nonbreaking spaces
            html = html.replace("&nbsp;", " ")

            const regexp : RegExp = /^\<b\>([^:]+):\<\/b\> ([^\<]+)\s*(-|—|–)\s*\<font color=\"(green|red)\"\>(True|Lie)\<\/font\>/g;
            if (regexp.test(html))
            {
                regexp.lastIndex = 0;
                let match = regexp.exec(html);
                let panelist : string = match![1];
                let statement : string = match![2];
                let truthValue : string = match![5];

                // Strip existing quotes
                const quote_regexp : RegExp = /\s*\"([^"]+)\"\s*/g

                if (quote_regexp.test(statement))
                {
                    quote_regexp.lastIndex = 0;
                    let quote_match = quote_regexp.exec(statement);
                    statement = quote_match![1];
                }

                // Handle possessions
                const possession_regexp : RegExp = /([^\(]+) \(Possession\)/g;
                if (possession_regexp.test(panelist))
                {
                    possession_regexp.lastIndex = 0;
                    let possession_match = possession_regexp.exec(panelist);
                    panelist = possession_match![1];
                    let team : string = davidsTeam.includes(panelist) ? "David" : (leesTeam.includes(panelist) ? "Lee" : "Rob");
                    let s : Statement = new Statement (panelist, team, statement, true, truthValue == 'True' ? true : false)
                    out.push(s)
                }
                else
                {
                    let team : string = davidsTeam.includes(panelist) ? "David" : (leesTeam.includes(panelist) ? "Lee" : "Rob");
                    let s : Statement = new Statement (panelist, team, statement, false, truthValue == 'True' ? true : false)
                    out.push(s)
                }

            }
        }
    )
    return out;
}

function toCSV (stmts : Statement[]) : string 
{
    if (stmts.length > 0)
    {
        let headers : string = Object.keys(stmts[0]).toString();
        let values : string[] = [headers];
        for (let i = 0; i < stmts.length; i++)
        {
            let out : string[] = [];
            out.push(stmts[i].panelist);
            out.push(stmts[i].team);
            out.push(`"${stmts[i].assertion}"`);
            out.push(stmts[i].possession ? "1" : "0");
            out.push(stmts[i].truthValue ? "1" : "0");
            values.push(out.join(","));

        }
        return values.join("\n");
    }
    else
    {
        return ""
    }
}

fs.readdir('data',
    (err, files) =>
    {
        files.forEach((file) =>
            {
                fs.readFile(`data/${file}`,
                    (err, data) =>
                        {
                            let html : string = data.toString();
                            const $ = cheerio.load(html)
                            let davidsTeam : string[] = getTeams($, "David")
                            let leesTeam : string[] = getTeams($, "Lee")
                            let stmts : Statement[] = getStatements($, davidsTeam, leesTeam)
                            let filename : string = `data/${file.replace(".html", "")}.csv`

                            fs.writeFile(filename, toCSV(stmts), (err) => {})                            
                        }
                )   
            }
        )
    }
)