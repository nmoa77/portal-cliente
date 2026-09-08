const fs=require('fs');
const path=require('path');

try{
  const file=path.join(__dirname,'server.js');
  let s=fs.readFileSync(file,'utf8');

  if(!s.includes('let socialPostTotals =')){
    s=s.replace(
      '  let socialPostStats = [];',
      `  let socialPostStats = [];
  let socialPostTotals = { published:0, scheduled:0, draft:0, cancelled:0, total:0 };
  if (hasSocial) {
    socialPostTotals = db.prepare(
      \`SELECT
          SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS published,
          SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) AS scheduled,
          SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) AS draft,
          SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
          COUNT(*) AS total
        FROM social_posts
        WHERE user_id = ?\`
    ).get(uid) || socialPostTotals;
  }`
    );
  }

  if(s.includes('    hasSocial, socialPostStats,')&&!s.includes('socialPostStats, socialPostTotals')){
    s=s.replace('    hasSocial, socialPostStats,','    hasSocial, socialPostStats, socialPostTotals,');
  }

  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[client-social-lifetime-total-patch]',e.message);}
