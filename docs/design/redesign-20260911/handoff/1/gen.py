# -*- coding: utf-8 -*-
"""배치1 handoff 생성기 — pick=A(홈)+C(투자). 셸 + home·transactions·invest·settings × 모바일 390 / 데스크톱 1440 + 상태 3종.
토큰 값 = DESIGN.md §2 라이트 열. 폰트는 캔버스 CSP 상 Google Fonts → Noto Sans KR(Pretendard 대역) + Geist Mono.
번들 HTML 은 S5 의 **참조**다. 코드에 그대로 붙이지 않는다.
실행: python3 gen.py → *.dc.html + canvas.json
"""
import json, pathlib

OUT = pathlib.Path(__file__).parent

CSS = """
:root{--bg:#FAF6EF;--surface:#FFFDF9;--surface2:#F3EEE4;--text:#3C3530;--dim:#7A6F63;--hair:#DDD5C9;--hair2:#EDE8E0;
--accent:#647A5C;--accent-soft:rgba(124,148,115,.14);--on-accent:#FFFFFF;--up:#DC2626;--down:#2563EB;--income:#2F855A;--expense:#C2674A;
--chart2:#C2674A;--chart3:#3C3530;--chart4:#A99C8D;--purple:#8B5CF6;--warning:#F59E0B;--danger:#EF4444;
--sans:"Noto Sans KR",Pretendard,-apple-system,system-ui,sans-serif;--mono:"Geist Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--bg)}
a{color:var(--accent);text-decoration:none;cursor:pointer}a:hover{color:#4F6348}
.phone,.desk{background:var(--bg);color:var(--text);font-family:var(--sans);letter-spacing:-0.01em;position:relative;overflow:hidden;-webkit-font-smoothing:antialiased}
.phone{width:390px;height:844px;display:flex;flex-direction:column}
.body{flex-grow:1;padding:16px 20px 0;overflow:hidden;display:flex;flex-direction:column}
.hdr{display:flex;justify-content:space-between;align-items:center;height:48px;flex-shrink:0}
.brand{font-size:15px;font-weight:800;color:var(--accent);letter-spacing:-0.03em}
.pill{display:flex;align-items:center;gap:4px;height:28px;padding:0 10px;border:1px solid var(--hair);border-radius:8px;font-size:12px;font-weight:600;color:var(--text)}
.title{font-size:22px;font-weight:800;letter-spacing:-0.03em}
.hdr-acts{display:flex;align-items:center;gap:14px}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums;letter-spacing:0}
.cap{font-family:var(--mono);font-size:11px;font-weight:500;color:var(--dim);letter-spacing:.02em}
.lbl{font-size:13px;font-weight:600;color:var(--dim)}
.hero{display:flex;flex-direction:column;gap:6px;padding:24px 0 10px}
.hero.compact{padding:20px 0 8px}
.n44{font-family:var(--mono);font-size:44px;font-weight:700;letter-spacing:-0.04em;line-height:1.05;white-space:nowrap;display:flex;align-items:baseline;gap:6px}
.n60{font-family:var(--mono);font-size:60px;font-weight:700;letter-spacing:-0.04em;line-height:1.05;white-space:nowrap;display:flex;align-items:baseline;gap:8px}
.n28{font-family:var(--mono);font-size:28px;font-weight:700;letter-spacing:-0.03em;line-height:1.1;white-space:nowrap;display:flex;align-items:baseline;gap:6px}
.won{font-family:var(--sans);font-size:14px;font-weight:500;color:var(--dim);letter-spacing:-0.01em}
.delta{display:flex;align-items:baseline;gap:8px;padding-top:4px}
.delta .d{font-family:var(--mono);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}
.delta .c{font-size:13px;font-weight:500;color:var(--dim)}
.up{color:var(--up)}.down{color:var(--down)}.inc{color:var(--income)}.exp{color:var(--expense)}.dim{color:var(--dim)}.acc{color:var(--accent)}.pur{color:var(--purple)}
.spark{display:block;width:100%;height:44px;margin:10px 0 4px}
.spark.tall{height:120px}
.hr{height:1px;background:var(--hair);margin:12px 0;flex-shrink:0}
.sec{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0 2px}
.sec h4{margin:0;font-size:14px;font-weight:700;letter-spacing:-0.03em}
.sec a{font-size:12px;font-weight:600}
.r{display:flex;justify-content:space-between;align-items:center;height:46px;border-bottom:1px solid var(--hair2);flex-shrink:0;gap:12px}
.r.tall{height:52px}.r.big{height:56px}
.r:last-child{border-bottom:0}
.r .l{display:flex;flex-direction:column;gap:2px;min-width:0}
.r .t{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r .m{font-size:11px;color:var(--dim);display:flex;align-items:center;gap:6px;white-space:nowrap}
.dot{width:6px;height:6px;border-radius:3px;display:inline-block;flex-shrink:0}
.r .rt{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.r .v{font-family:var(--mono);font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.r .v.v18{font-size:18px}
.r .sub{font-family:var(--mono);font-size:11px;color:var(--dim);font-variant-numeric:tabular-nums}
.r .chev{color:var(--dim);display:flex;flex-shrink:0}
.r .rt.row{flex-direction:row;align-items:center;gap:8px}
.bar{width:120px;height:2px;background:var(--hair2);display:flex}
.bar i{height:2px;display:block}
.subbar{display:flex;align-items:center;gap:8px}.subbar .bar{width:80px}
.stat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:6px 0 8px}
.stat .l{font-size:12px;font-weight:600;color:var(--dim)}
.stat .v{font-family:var(--mono);font-size:18px;font-weight:600;margin-top:4px;font-variant-numeric:tabular-nums;white-space:nowrap}
.chips{display:flex;gap:16px;height:32px;align-items:flex-end;margin-top:10px}
.chips span{font-size:13px;font-weight:600;color:var(--dim);padding-bottom:6px;border-bottom:2px solid transparent;white-space:nowrap}
.chips span.on{color:var(--accent);border-bottom-color:var(--accent)}
.chart{display:block;width:100%;height:140px;margin-top:12px}
.chart.tall{height:200px}
.axis{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));font-family:var(--mono);font-size:10px;color:var(--dim);text-align:center;margin-top:6px}
.fab{position:absolute;right:16px;bottom:78px;height:40px;padding:0 16px;border-radius:8px;background:var(--accent);color:var(--on-accent);font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.tab{height:64px;border-top:1px solid var(--hair);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));background:var(--bg);flex-shrink:0}
.tab div{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:var(--dim);gap:4px;font-weight:600}
.tab div.on{color:var(--accent)}
.tab svg{width:20px;height:20px}
.ico{width:20px;height:20px;color:var(--dim)}
.empty{font-size:13px;color:var(--dim);padding:14px 0;display:flex;gap:8px;align-items:baseline}
.seg{display:flex;background:var(--surface2);border-radius:8px;padding:3px;gap:2px}
.seg span{flex:1 1 0;text-align:center;font-size:13px;font-weight:600;color:var(--dim);height:30px;line-height:30px;border-radius:6px}
.seg span.on{background:var(--surface);color:var(--text)}
.seg.sm span{font-size:12px;height:26px;line-height:26px;padding:0 10px}
.month{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:15px;font-weight:600;padding:8px 0 4px}
.month .arr{color:var(--dim);display:flex}
.filters{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-top:6px}
.input{height:36px;padding:0 12px;background:var(--surface2);border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:13px;font-weight:500;color:var(--text);min-width:120px}
.dh{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--dim);letter-spacing:.06em;text-transform:uppercase;padding:14px 0 4px;border-bottom:1px solid var(--hair)}
.tag{font-family:var(--mono);font-size:10px;font-weight:600;color:var(--warning);border:1px solid var(--warning);border-radius:4px;padding:0 4px;line-height:14px}
.btn{height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;padding:0 20px}
.btn.outline{border:1px solid var(--hair);color:var(--text)}
.btn.filled{background:var(--accent);color:var(--on-accent)}
.btn.sm{height:36px;font-size:13px;padding:0 16px}
.avatar{width:44px;height:44px;border-radius:8px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:var(--accent)}
.skel{background:var(--surface2);border-radius:4px}
.note{font-size:13px;color:var(--dim);line-height:1.6}
.statebox{border:1px dashed var(--hair);border-radius:8px;padding:12px 16px;margin-top:8px}
.statebox .h{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--dim);text-transform:uppercase;margin-bottom:6px}
/* 데스크톱 */
.desk{width:1440px;height:900px;display:grid;grid-template-columns:220px minmax(0,1fr)}
.side{border-right:1px solid var(--hair);padding:24px 16px;display:flex;flex-direction:column;gap:2px}
.side .brand{font-size:18px;padding:0 8px 20px}
.side .hh{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--hair);border-radius:8px;margin-bottom:16px}
.side .hh .n{font-size:14px;font-weight:700}.side .hh .c{font-size:11px;color:var(--dim)}
.nav{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:14px;font-weight:600;color:var(--dim)}
.nav svg{width:20px;height:20px}
.nav.on{background:var(--accent-soft);color:var(--accent)}
.side .btn{margin-top:auto}
.main{padding:32px 40px;display:grid;grid-template-columns:720px 320px;gap:48px;align-content:start;overflow:hidden}
.main .col{display:flex;flex-direction:column;min-width:0}
.main .rail{display:flex;flex-direction:column;padding-top:8px}
.main .hdr{height:40px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);text-align:left;padding:8px 0;border-bottom:1px solid var(--hair)}
th.n,td.n{text-align:right;font-family:var(--mono);font-variant-numeric:tabular-nums;font-weight:600}
td{padding:12px 0;border-bottom:1px solid var(--hair2);white-space:nowrap}
td.dim{color:var(--dim);font-weight:500}
tr:last-child td{border-bottom:0}
.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-top:1px solid var(--hair2);border-left:1px solid var(--hair2)}
.cal div{border-right:1px solid var(--hair2);border-bottom:1px solid var(--hair2);height:44px;padding:4px 6px;font-family:var(--mono);font-size:10px;color:var(--dim);display:flex;flex-direction:column;justify-content:space-between}
.cal div b{font-weight:500;color:var(--text)}
.cal div.on{background:var(--accent-soft)}
"""

ICONS = {
    "홈": '<path d="M3 11l9-8 9 8v10H3z"/>',
    "거래": '<path d="M4 6h16M4 12h16M4 18h10"/>',
    "투자": '<path d="M3 17l6-6 4 4 8-8"/>',
    "내정보": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
}
SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
REFRESH = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/></svg>'
CHEV_D = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
CHEV_R = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'
ARR_L = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>'
ARR_R = CHEV_R
EYE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'


def tab(active):
    cells = []
    for name, path in ICONS.items():
        on = ' class="on"' if name == active else ""
        cells.append(f'<div{on}>{SVG}{path}</svg>{name}</div>')
    return '<div class="tab">' + "".join(cells) + "</div>"


def wrap(inner):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700;800&family=Geist+Mono:wght@500;600;700&display=swap">
  <style>{CSS}</style>
</helmet>
{inner}
</x-dc>
</body>
</html>
"""


def phone(body, active, fab=True):
    fab_html = '<div class="fab">＋ 기록</div>' if fab else ""
    return wrap(f'<div class="phone">\n  <div class="body">\n{body}\n  </div>\n  {fab_html}\n  {tab(active)}\n</div>')


def desk(col, rail, active):
    nav = "".join(f'<div class="nav{" on" if n == active else ""}">{SVG}{p}</svg>{n}</div>' for n, p in ICONS.items())
    side = (f'<div class="side"><div class="brand">모음</div>'
            f'<div class="hh"><div><div class="n">우리집</div><div class="c">관리 중 2</div></div><span class="dim">{CHEV_D}</span></div>'
            f'{nav}<div class="btn filled">기록하기</div></div>')
    return wrap(f'<div class="desk">{side}<div class="main"><div class="col">\n{col}\n</div><div class="rail">\n{rail}\n</div></div></div>')


def hdr_home():
    return f'<div class="hdr"><span class="brand">모음</span><span class="pill">우리집 {CHEV_D}</span></div>'


def hdr_title(title, acts=""):
    return f'<div class="hdr"><span class="title">{title}</span><div class="hdr-acts">{acts}</div></div>'


def sec(title, link="전체"):
    l = f"<a>{link}</a>" if link else ""
    return f'<div class="sec"><h4>{title}</h4>{l}</div>'


def row(t, m, v, vcls="", bar=None, sub=None, h="", dot=None, chev=False, tag=None):
    meta = ""
    if m:
        d = f'<span class="dot" style="background:{dot}"></span>' if dot else ""
        meta = f'<div class="m">{d}{m}</div>'
    tg = f'<span class="tag">{tag}</span>' if tag else ""
    right = f'<div class="v {vcls}">{v}</div>' if v is not None else ""
    if bar and sub:
        pct, col = bar
        right += f'<div class="subbar"><span class="sub">{sub}</span><span class="bar"><i style="width:{pct}%;background:{col}"></i></span></div>'
    elif sub:
        right += f'<div class="sub">{sub}</div>'
    elif bar:
        pct, col = bar
        right += f'<div class="bar"><i style="width:{pct}%;background:{col}"></i></div>'
    rt = f'<div class="rt">{right}</div>'
    if chev:
        rt = f'<div class="rt row">{right}<span class="chev">{CHEV_R}</span></div>'
    return f'<div class="r {h}"><div class="l"><div class="t" style="display:flex;gap:6px;align-items:center">{t}{tg}</div>{meta}</div>{rt}</div>'


def stat3(items):
    cells = "".join(f'<div><div class="l">{l}</div><div class="v {c}">{v}</div></div>' for l, v, c in items)
    return f'<div class="stat">{cells}</div>'


def spark(tall=False, w=350):
    pts = [(0, 36), (58, 30), (116, 32), (174, 22), (232, 24), (290, 14), (350, 6)]
    if tall:
        pts = [(x * w / 350, 20 + (y - 6) * 90 / 30) for x, y in pts]
    p = " ".join(f"{x:.0f},{y:.0f}" for x, y in pts)
    lx, ly = pts[-1]
    return (f'<svg class="spark{" tall" if tall else ""}" viewBox="0 0 {w} {120 if tall else 44}" preserveAspectRatio="none">'
            f'<polyline fill="none" stroke="#647A5C" stroke-width="1.5" points="{p}"/><circle cx="{lx:.0f}" cy="{ly:.0f}" r="3" fill="#DC2626"/></svg>')


def chart12(points, y_label=None, tall=False):
    pts = " ".join(f"{i*31.8:.1f},{y}" for i, y in enumerate(points))
    lx, ly = (len(points) - 1) * 31.8, points[-1]
    lab = f'<text x="{lx-4:.1f}" y="{ly-10}" text-anchor="end" font-family="Geist Mono, monospace" font-size="11" font-weight="600" fill="#DC2626">{y_label}</text>' if y_label else ""
    return (f'<svg class="chart{" tall" if tall else ""}" viewBox="0 0 350 160" preserveAspectRatio="none">'
            f'<line x1="0" y1="159" x2="350" y2="159" stroke="#DDD5C9" stroke-width="1"/>'
            f'<polyline fill="none" stroke="#647A5C" stroke-width="1.5" points="{pts}"/>'
            f'<circle cx="{lx:.1f}" cy="{ly}" r="3.5" fill="#DC2626"/>{lab}</svg>'
            '<div class="axis"><span>10</span><span>11</span><span>12</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div>')


TX = [
    ("09.11 THU", [("스타벅스", "카페 · 신한 체크", "−5,600", "exp", "#C2674A", None), ("넷플릭스", "구독 · 신한 체크", "−17,000", "exp", "#C2674A", "고정")]),
    ("09.10 WED", [("급여", "수입 · 국민 급여통장", "+4,800,000", "inc", "#2F855A", None), ("비상금 이체", "국민 → 카카오 세이프박스", "500,000", "pur", "#8B5CF6", None)]),
    ("09.09 TUE", [("이마트", "식료품 · 신한 체크", "−86,400", "exp", "#C2674A", None), ("점심 김밥천국", "외식 · 신한 체크", "−9,000", "exp", "#C2674A", None)]),
]


def tx_rows(groups, balance=False, limit=None):
    out = []
    n = 0
    for date, items in groups:
        out.append(f'<div class="dh">{date}</div>')
        for t, m, v, c, dot, tag in items:
            if limit and n >= limit:
                break
            out.append(row(t, m, v, c, dot=dot, sub=("잔액 1,234,000" if balance else None), tag=tag))
            n += 1
    return "\n".join(out)


HOME_WHY = (
    row("순저축", '<span class="inc">수입 4,800,000</span>&nbsp;−&nbsp;<span class="exp">지출 3,000,000</span>', "+1,800,000", "", bar=(56, "#647A5C"))
    + row("투자손익", "평가 +1,120,000 · 실현 +320,000", "+1,440,000", "up", bar=(44, "#DC2626"))
)
HOME_ALLOC = row("주식·ETF", None, "100,000,000", "", bar=(78, "#647A5C"), sub="78%") + row("현금·예금", None, "28,450,000", "", bar=(22, "#C2674A"), sub="22%")
RECENT2 = (row("스타벅스", "카페 · 9.11 · 신한 체크", "−5,600", "exp", dot="#C2674A")
           + row("급여", "수입 · 9.10 · 국민 급여통장", "+4,800,000", "inc", dot="#2F855A"))

# ===================== 홈 (A) =====================
home_m = "\n".join([
    hdr_home(),
    f'<div class="hero"><div style="display:flex;justify-content:space-between;align-items:center"><span class="cap">2026.09.11 기준 · <a class="cap acc">9월 기록</a></span><span class="dim">{EYE}</span></div><span class="lbl">총자산</span>'
    '<div class="n44">128,450,000<span class="won">원</span></div>'
    '<div class="delta"><span class="d up">▲ 3,240,000</span><span class="c">+2.6% · 지난달보다</span></div></div>',
    spark(),
    '<div class="hr"></div>', sec("이번 달 늘어난 이유", "자세히"), HOME_WHY,
    '<div class="hr"></div>', sec("자산 구성"), HOME_ALLOC,
    '<div class="hr"></div>', sec("최근 기록"), RECENT2,
])

home_d_col = "\n".join([
    f'<div class="hero" style="padding-top:0"><div style="display:flex;justify-content:space-between;align-items:center"><span class="cap">2026.09.11 기준 · <a class="cap acc">9월 기록</a></span><span class="dim">{EYE}</span></div><span class="lbl">총자산</span>'
    '<div class="n60">128,450,000<span class="won">원</span></div>'
    '<div class="delta"><span class="d up" style="font-size:24px">▲ 3,240,000</span><span class="c" style="font-size:15px">+2.6% · 지난달보다</span></div></div>',
    spark(tall=True, w=720),
    '<div class="hr"></div>', sec("이번 달 늘어난 이유", "자세히"), HOME_WHY,
    '<div class="hr"></div>', sec("자산 구성"), HOME_ALLOC,
    '<div class="hr"></div>', sec("최근 기록"),
    '<table><tr><th>날짜</th><th>내용</th><th>통장</th><th class="n">금액</th></tr>'
    '<tr><td class="dim mono">09.11</td><td>스타벅스 <span class="dim">· 카페</span></td><td class="dim">신한 체크</td><td class="n exp">−5,600</td></tr>'
    '<tr><td class="dim mono">09.11</td><td>넷플릭스 <span class="dim">· 구독</span></td><td class="dim">신한 체크</td><td class="n exp">−17,000</td></tr>'
    '<tr><td class="dim mono">09.10</td><td>급여 <span class="dim">· 수입</span></td><td class="dim">국민 급여통장</td><td class="n inc">+4,800,000</td></tr>'
    '<tr><td class="dim mono">09.10</td><td>비상금 이체 <span class="dim">· 이체</span></td><td class="dim">국민 → 카카오</td><td class="n pur">500,000</td></tr>'
    '<tr><td class="dim mono">09.09</td><td>이마트 <span class="dim">· 식료품</span></td><td class="dim">신한 체크</td><td class="n exp">−86,400</td></tr></table>',
])
home_d_rail = "\n".join([
    sec("이번 달", "거래 전체"),
    row("수입", None, "4,800,000", "inc"), row("지출", None, "3,000,000", "exp"), row("저축률", None, "37.5%", ""),
    '<div class="hr"></div>', sec("지출 Top 3", None),
    row("식료품", None, "1,120,000", "", bar=(37, "#C2674A"), sub="37%"),
    row("외식", None, "640,000", "", bar=(21, "#C2674A"), sub="21%"),
    row("교통", None, "310,000", "", bar=(10, "#C2674A"), sub="10%"),
    '<div class="hr"></div>', sec("투자", "투자 전체"),
    row("평가금액", None, "100,000,000", ""), row("평가손익", None, "+1,440,000", "up", sub="+1.46%"),
])

# ===================== 거래 =====================
seg_view = '<div class="seg sm"><span class="on">목록</span><span>달력</span></div>'
tx_top = "\n".join([
    hdr_title("거래", seg_view),
    f'<div class="month"><span class="arr">{ARR_L}</span>2026.09<span class="arr">{ARR_R}</span></div>',
    stat3([("수입", "4,800,000", "inc"), ("지출", "3,000,000", "exp"), ("저축률", "37.5%", "")]),
    f'<a style="font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px">지출 Top 5 {CHEV_D}</a>',
    '<div class="hr"></div>',
    f'<div class="filters"><div class="chips" style="margin-top:0"><span class="on">전체</span><span>수입</span><span>지출</span><span>이체</span></div><div class="input">신한 체크 {CHEV_D}</div></div>',
])
tx_m = "\n".join([tx_top, tx_rows(TX, balance=True, limit=5)])

tx_d_col = "\n".join([
    hdr_title("거래", f'<div class="month" style="padding:0"><span class="arr">{ARR_L}</span>2026.09<span class="arr">{ARR_R}</span></div>' + seg_view),
    f'<div class="filters" style="margin-top:12px"><div class="chips" style="margin-top:0"><span class="on">전체</span><span>수입</span><span>지출</span><span>이체</span></div><div class="input">신한 체크 {CHEV_D}</div></div>',
    tx_rows(TX, balance=True),
])
cal_cells = []
for d in range(1, 31):
    cls = ' class="on"' if d == 11 else ""
    amt = {11: '<span class="exp">−2.3만</span>', 10: '<span class="inc">+480만</span>', 9: '<span class="exp">−9.5만</span>', 5: '<span class="exp">−4.2만</span>', 1: '<span class="exp">−13만</span>'}.get(d, "")
    cal_cells.append(f'<div{cls}><b>{d}</b>{amt}</div>')
tx_d_rail = "\n".join([
    sec("이번 달", None),
    stat3([("수입", "4,800,000", "inc"), ("지출", "3,000,000", "exp"), ("저축률", "37.5%", "")]),
    '<div class="hr"></div>', sec("지출 Top 5", None),
    row("식료품", None, "1,120,000", "", bar=(37, "#C2674A"), sub="37%"),
    row("외식", None, "640,000", "", bar=(21, "#C2674A"), sub="21%"),
    row("교통", None, "310,000", "", bar=(10, "#C2674A"), sub="10%"),
    row("구독", None, "97,000", "", bar=(3, "#C2674A"), sub="3%"),
    row("카페", None, "88,000", "", bar=(3, "#C2674A"), sub="3%"),
    '<div class="hr"></div>', sec("달력", None),
    '<div class="cal">' + '<div class="cap">일</div><div class="cap">월</div><div class="cap">화</div><div class="cap">수</div><div class="cap">목</div><div class="cap">금</div><div class="cap">토</div><div></div>' + "".join(cal_cells) + '</div>',
])

# ===================== 투자 (C) =====================
inv_acts = f'{REFRESH}<a style="font-size:13px;font-weight:600">종목 추가</a>'
INV_ACCTS = (row("테스트증권", "3종목 · 현금 2,300,000", "72,000,000", "", sub='<span class="up">▲ 1.9%</span>', h="tall", chev=True)
             + row("키움 ISA", "2종목 · 현금 0", "28,000,000", "", sub='<span class="down">▼ 0.4%</span>', h="tall", chev=True))
INV_SHARE = (row("삼성전자", None, "42,000,000", "", bar=(42, "#647A5C"), sub="42%")
             + row("TIGER 미국S&amp;P500", None, "31,000,000", "", bar=(31, "#C2674A"), sub="31%")
             + row("외 3개", None, "22,000,000", "", bar=(22, "#3C3530"), sub="22%")
             + row("현금", None, "5,000,000", "", bar=(5, "#A99C8D"), sub="5%"))
inv_m = "\n".join([
    hdr_title("투자", inv_acts),
    '<div class="hero compact"><span class="lbl">평가금액 · <span class="cap">15:30 시세</span></span>'
    '<div class="n28">100,000,000<span class="won">원</span><span class="mono up" style="font-size:14px;font-weight:600;margin-left:6px">▲ 1.46%</span></div></div>',
    chart12([110, 118, 100, 96, 104, 90, 86, 92, 74, 66, 58, 40], "100.0M"),
    '<div class="chips"><span>1개월</span><span>3개월</span><span class="on">12개월</span><span>전체</span></div>',
    '<div class="hr"></div>',
    stat3([("평가손익", "+1,440,000", "up"), ("매입금액", "98,560,000", ""), ("현금", "2,300,000", "")]),
    '<div class="hr"></div>', sec("계좌"), INV_ACCTS,
    '<div class="hr"></div>', sec("종목 비중"),
    row("삼성전자", None, "42,000,000", "", bar=(42, "#647A5C"), sub="42%"),
    row("TIGER 미국S&amp;P500", None, "31,000,000", "", bar=(31, "#C2674A"), sub="31%"),
])
inv_d_col = "\n".join([
    hdr_title("투자", inv_acts),
    '<div class="hero" style="padding-top:12px"><span class="lbl">평가금액 · <span class="cap">2026.09.11 15:30 시세</span></span>'
    '<div class="n44">100,000,000<span class="won">원</span><span class="mono up" style="font-size:20px;font-weight:600;margin-left:8px">▲ 1,440,000 · +1.46%</span></div></div>',
    chart12([110, 118, 100, 96, 104, 90, 86, 92, 74, 66, 58, 40], "100.0M", tall=True),
    '<div class="chips"><span>1개월</span><span>3개월</span><span class="on">12개월</span><span>전체</span></div>',
    '<div class="hr"></div>',
    stat3([("평가손익", "+1,440,000", "up"), ("매입금액", "98,560,000", ""), ("현금", "2,300,000", "")]),
    '<div class="hr"></div>', sec("계좌"), INV_ACCTS,
])
inv_d_rail = "\n".join([sec("종목 비중", None), INV_SHARE, '<div class="hr"></div>', sec("실현손익 · 9월", "기간"),
                        row("실현", None, "+320,000", "up", sub="+0.9%"), row("매도 · 매수", None, "2건 · 5건", "dim"), row("수수료·세금", None, "−4,120", "dim")])

# ===================== 내정보 =====================
seg_mode = '<div class="seg"><span class="on">라이트</span><span>다크</span><span>시스템</span></div>'
profile = ('<div style="display:flex;align-items:center;gap:14px;padding:16px 0 4px"><div class="avatar">양</div><div><div class="title">양진호</div><div class="lbl" style="font-weight:500">yangjinho@example.com</div></div></div>'
           + stat3([("통장", "3", ""), ("거래", "128", ""), ("종목", "5", "")]))
HH_ROWS = (row("우리집", "소유자 · 전체 2개", None, chev=True, h="tall")
           + row("가계부 관리", None, None, chev=True) + row("멤버 관리", "2명", None, chev=True))
MANAGE_ROWS = (row("카테고리", None, "12", "dim", chev=True) + row("고정지출", None, "4", "dim", chev=True) + row("통장", None, "3", "dim", chev=True))
set_m = "\n".join([
    hdr_title("내정보"), profile,
    '<div class="hr"></div>', sec("가계부", None), HH_ROWS,
    '<div class="hr"></div>', sec("화면 모드", None), seg_mode,
    '<div class="hr"></div>', sec("관리", None), MANAGE_ROWS,
    '<div class="hr"></div>', '<div class="btn outline">로그아웃</div>',
])
set_d_col = "\n".join([
    hdr_title("내정보"), profile,
    '<div class="hr"></div>', sec("가계부", None), HH_ROWS,
    '<div class="hr"></div>', sec("관리", None), MANAGE_ROWS,
])
set_d_rail = "\n".join([sec("화면 모드", None), seg_mode, '<div class="hr"></div>', '<div class="btn outline">로그아웃</div>'])

# ===================== 상태 3종 (홈 기준) =====================
states = "\n".join([
    hdr_home(),
    '<div class="statebox"><div class="h">빈 — 스냅샷 0 · 거래 0</div>'
    '<span class="lbl">총자산</span><div class="n28">0<span class="won">원</span></div>'
    '<div class="empty">첫 기록을 남기면 지난달 비교가 시작돼요 <a>지금 기록</a></div>'
    + sec("최근 기록") + '<div class="empty">아직 기록이 없어요 <a>＋ 기록</a></div></div>',
    '<div class="statebox"><div class="h">로딩 — 섹션 단위 Suspense</div>'
    '<div class="skel" style="width:60px;height:13px"></div><div class="skel" style="width:240px;height:44px;margin-top:8px"></div><div class="skel" style="width:160px;height:20px;margin-top:10px"></div>'
    '<div class="hr"></div><div class="skel" style="width:120px;height:14px"></div>'
    '<div class="r"><div class="skel" style="width:90px;height:14px"></div><div class="skel" style="width:80px;height:14px"></div></div>'
    '<div class="r"><div class="skel" style="width:70px;height:14px"></div><div class="skel" style="width:96px;height:14px"></div></div></div>',
    '<div class="statebox"><div class="h">에러 — 섹션 인라인 · danger 아님</div>'
    + sec("이번 달 늘어난 이유", "자세히") + '<div class="empty">불러오지 못했어요 <a>다시 시도</a></div>'
    + '<div class="hr"></div>' + sec("최근 기록") + '<div class="empty">불러오지 못했어요 <a>다시 시도</a></div></div>',
    '<p class="note" style="margin:12px 0 0">전체 화면 ErrorFallback 은 셸 밖 오류(인증·라우트)만. 시세 새로고침 실패는 토스트(기존).</p>',
])

FILES = {
    "Main.dc.html": phone(home_m, "홈"),
    "Transactions.dc.html": phone(tx_m, "거래"),
    "Invest.dc.html": phone(inv_m, "투자", fab=False),
    "Settings.dc.html": phone(set_m, "내정보", fab=False),
    "HomeDesktop.dc.html": desk(home_d_col, home_d_rail, "홈"),
    "TransactionsDesktop.dc.html": desk(tx_d_col, tx_d_rail, "거래"),
    "InvestDesktop.dc.html": desk(inv_d_col, inv_d_rail, "투자"),
    "SettingsDesktop.dc.html": desk(set_d_col, set_d_rail, "내정보"),
    "States.dc.html": phone(states, "홈", fab=False),
}
for name, html in FILES.items():
    (OUT / name).write_text(html, encoding="utf-8")

W, H, DW, DH, GX, GY = 390, 844, 1440, 900, 110, 160
canvas = {
    "artboards": [
        {"file": "Main.dc.html", "x": 0, "y": 0, "w": W, "h": H, "title": "home · 390"},
        {"file": "Transactions.dc.html", "x": W + GX, "y": 0, "w": W, "h": H, "title": "transactions · 390"},
        {"file": "Invest.dc.html", "x": 2 * (W + GX), "y": 0, "w": W, "h": H, "title": "invest · 390"},
        {"file": "Settings.dc.html", "x": 3 * (W + GX), "y": 0, "w": W, "h": H, "title": "settings · 390"},
        {"file": "States.dc.html", "x": 4 * (W + GX), "y": 0, "w": W, "h": H, "title": "상태 3종 · 홈"},
        {"file": "HomeDesktop.dc.html", "x": 0, "y": H + GY, "w": DW, "h": DH, "title": "home · 1440"},
        {"file": "TransactionsDesktop.dc.html", "x": DW + GX, "y": H + GY, "w": DW, "h": DH, "title": "transactions · 1440"},
        {"file": "InvestDesktop.dc.html", "x": 0, "y": H + GY + DH + GY, "w": DW, "h": DH, "title": "invest · 1440"},
        {"file": "SettingsDesktop.dc.html", "x": DW + GX, "y": H + GY + DH + GY, "w": DW, "h": DH, "title": "settings · 1440"},
    ],
    "annotations": [
        {"id": "pick", "x": 0, "y": -200, "w": 520, "text": "배치1 handoff — pick = A(홈: 결과 하나) + C(투자: 12개월 추이).\n셸: 헤더 48(브랜드 + 가계부 pill) · 탭바 64 · '＋ 기록' 40px 은 홈·거래만 · 데스크톱 사이드바 220 + 판면 720 + 레일 320.\n색은 금액과 ▲▼ 에만: 수입 초록 / 지출 테라코타 / 이체 보라 / 상승 빨강 / 하락 파랑 / 행동 세이지. 폰트 Noto Sans KR 은 Pretendard 대역."},
        {"id": "nav", "x": 4 * (W + GX), "y": -120, "w": 390, "text": "화면 이동 = 탭바 4개(홈·거래·투자·내정보). 이 캔버스는 아트보드 간 링크가 안 돼 정적. 상태 3종은 우측 아트보드."},
    ],
    "launch": {"view": "canvas"},
}
(OUT / "canvas.json").write_text(json.dumps(canvas, ensure_ascii=False, indent=2), encoding="utf-8")
print("ok", len(FILES))
