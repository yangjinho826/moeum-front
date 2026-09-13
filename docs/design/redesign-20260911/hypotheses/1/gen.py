# -*- coding: utf-8 -*-
"""배치1 가설 A/B/C 아트보드 생성기 — 홈·투자 × 3 = 6장 (390×844, 라이트).
토큰 값은 DESIGN.md §2 라이트 열 그대로. 폰트는 캔버스 CSP 상 Google Fonts 만 → Noto Sans KR(Pretendard 대역) + Geist Mono.
실행: python3 gen.py  → *.dc.html + canvas.json
"""
import json, pathlib

OUT = pathlib.Path(__file__).parent

CSS = """
:root{--bg:#FAF6EF;--surface:#FFFDF9;--surface2:#F3EEE4;--text:#3C3530;--dim:#7A6F63;--hair:#DDD5C9;--hair2:#EDE8E0;
--accent:#647A5C;--accent-soft:rgba(124,148,115,.14);--on-accent:#FFFFFF;--up:#DC2626;--down:#2563EB;--income:#2F855A;--expense:#C2674A;
--chart2:#C2674A;--chart3:#3C3530;--chart4:#A99C8D;--purple:#8B5CF6;
--sans:"Noto Sans KR",Pretendard,-apple-system,system-ui,sans-serif;--mono:"Geist Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--bg)}
a{color:var(--accent);text-decoration:none}a:hover{color:#4F6348}
.phone{width:390px;height:844px;background:var(--bg);color:var(--text);font-family:var(--sans);letter-spacing:-0.01em;position:relative;display:flex;flex-direction:column;overflow:hidden;-webkit-font-smoothing:antialiased}
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
.hero.compact{padding:24px 0 8px}
.n44{font-family:var(--mono);font-size:44px;font-weight:700;letter-spacing:-0.04em;line-height:1.05;white-space:nowrap;display:flex;align-items:baseline;gap:6px}
.n28{font-family:var(--mono);font-size:28px;font-weight:700;letter-spacing:-0.03em;line-height:1.1;white-space:nowrap;display:flex;align-items:baseline;gap:6px}
.won{font-family:var(--sans);font-size:14px;font-weight:500;color:var(--dim);letter-spacing:-0.01em}
.delta{display:flex;align-items:baseline;gap:8px;padding-top:4px}
.delta .d{font-family:var(--mono);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}
.delta .c{font-size:13px;font-weight:500;color:var(--dim)}
.up{color:var(--up)}.down{color:var(--down)}.inc{color:var(--income)}.exp{color:var(--expense)}.dim{color:var(--dim)}.acc{color:var(--accent)}
.spark{display:block;width:100%;height:44px;margin:10px 0 4px}
.hr{height:1px;background:var(--hair);margin:12px 0;flex-shrink:0}
.sec{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0 2px}
.sec h4{margin:0;font-size:14px;font-weight:700;letter-spacing:-0.03em}
.sec a{font-size:12px;font-weight:600}
.r{display:flex;justify-content:space-between;align-items:center;height:46px;border-bottom:1px solid var(--hair2);flex-shrink:0}
.r.tall{height:52px}.r.big{height:56px}
.r:last-child{border-bottom:0}
.r .l{display:flex;flex-direction:column;gap:2px}
.r .t{font-size:14px;font-weight:600}
.r .m{font-size:11px;color:var(--dim);display:flex;align-items:center;gap:6px}
.dot{width:6px;height:6px;border-radius:3px;display:inline-block}
.r .rt{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.r .v{font-family:var(--mono);font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;text-align:right}
.r .v.v18{font-size:18px}
.r .sub{font-family:var(--mono);font-size:11px;color:var(--dim);font-variant-numeric:tabular-nums}
.bar{width:120px;height:2px;background:var(--hair2);display:flex}
.bar i{height:2px;display:block}
.subbar{display:flex;align-items:center;gap:8px}.subbar .bar{width:80px}
.stat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:6px 0 8px}
.stat .l{font-size:12px;font-weight:600;color:var(--dim)}
.stat .v{font-family:var(--mono);font-size:18px;font-weight:600;margin-top:4px;font-variant-numeric:tabular-nums;white-space:nowrap}
.chips{display:flex;gap:16px;height:32px;align-items:flex-end;margin-top:10px}
.chips span{font-size:13px;font-weight:600;color:var(--dim);padding-bottom:6px;border-bottom:2px solid transparent}
.chips span.on{color:var(--accent);border-bottom-color:var(--accent)}
.chart{display:block;width:100%;height:140px;margin-top:12px}
.axis{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));font-family:var(--mono);font-size:10px;color:var(--dim);text-align:center;margin-top:6px}
.fab{position:absolute;right:16px;bottom:78px;height:40px;padding:0 16px;border-radius:8px;background:var(--accent);color:var(--on-accent);font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.tab{height:64px;border-top:1px solid var(--hair);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));background:var(--bg);flex-shrink:0}
.tab div{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:var(--dim);gap:4px;font-weight:600}
.tab div.on{color:var(--accent)}
.tab svg{width:20px;height:20px}
.ico{width:20px;height:20px;color:var(--dim)}
.empty{font-size:13px;color:var(--dim);padding:12px 0}
"""

ICONS = {
    "홈": '<path d="M3 11l9-8 9 8v10H3z"/>',
    "거래": '<path d="M4 6h16M4 12h16M4 18h10"/>',
    "투자": '<path d="M3 17l6-6 4 4 8-8"/>',
    "내정보": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
}
REFRESH = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/></svg>'
CHEV = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'


def tab(active):
    cells = []
    for name, path in ICONS.items():
        on = ' class="on"' if name == active else ""
        cells.append(f'<div{on}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{path}</svg>{name}</div>')
    return '<div class="tab">' + "".join(cells) + "</div>"


def page(body, active, fab=True):
    fab_html = '<div class="fab">＋ 기록</div>' if fab else ""
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
<div class="phone">
  <div class="body">
{body}
  </div>
  {fab_html}
  {tab(active)}
</div>
</x-dc>
</body>
</html>
"""


def hdr_home():
    return f'<div class="hdr"><span class="brand">모음</span><span class="pill">우리집 {CHEV}</span></div>'


def hdr_invest():
    return f'<div class="hdr"><span class="title">투자</span><div class="hdr-acts">{REFRESH}<a style="font-size:13px;font-weight:600">종목 추가</a></div></div>'


def sec(title, link="전체"):
    return f'<div class="sec"><h4>{title}</h4><a>{link}</a></div>'


def row(t, m, v, vcls="", bar=None, sub=None, h="", dot=None):
    meta = ""
    if m:
        d = f'<span class="dot" style="background:{dot}"></span>' if dot else ""
        meta = f'<div class="m">{d}{m}</div>'
    right = f'<div class="v {vcls}">{v}</div>'
    if bar and sub:
        pct, col = bar
        right += f'<div class="subbar"><span class="sub">{sub}</span><span class="bar"><i style="width:{pct}%;background:{col}"></i></span></div>'
    elif sub:
        right += f'<div class="sub">{sub}</div>'
    elif bar:
        pct, col = bar
        right += f'<div class="bar"><i style="width:{pct}%;background:{col}"></i></div>'
    return f'<div class="r {h}"><div class="l"><div class="t">{t}</div>{meta}</div><div class="rt">{right}</div></div>'


SPARK = '<svg class="spark" viewBox="0 0 350 44" preserveAspectRatio="none"><polyline fill="none" stroke="#647A5C" stroke-width="1.5" points="0,36 58,30 116,32 174,22 232,24 290,14 350,6"/><circle cx="350" cy="6" r="3" fill="#DC2626"/></svg>'


def chart12(points, last_up=True, y_label=None):
    pts = " ".join(f"{i*31.8:.1f},{y}" for i, y in enumerate(points))
    lx, ly = (len(points) - 1) * 31.8, points[-1]
    col = "#DC2626" if last_up else "#2563EB"
    lab = f'<text x="{lx-4:.1f}" y="{ly-10}" text-anchor="end" font-family="Geist Mono, monospace" font-size="11" font-weight="600" fill="{col}">{y_label}</text>' if y_label else ""
    return (f'<svg class="chart" viewBox="0 0 350 160" preserveAspectRatio="none">'
            f'<line x1="0" y1="159" x2="350" y2="159" stroke="#DDD5C9" stroke-width="1"/>'
            f'<polyline fill="none" stroke="#647A5C" stroke-width="1.5" points="{pts}"/>'
            f'<circle cx="{lx:.1f}" cy="{ly}" r="3.5" fill="{col}"/>{lab}</svg>'
            '<div class="axis"><span>10</span><span>11</span><span>12</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div>')


def stat3(items):
    cells = "".join(f'<div><div class="l">{l}</div><div class="v {c}">{v}</div></div>' for l, v, c in items)
    return f'<div class="stat">{cells}</div>'


RECENT = (
    row("스타벅스", "카페 · 9.11 · 신한 체크", "−5,600", "exp", dot="#C2674A")
    + row("급여", "수입 · 9.10 · 국민 급여통장", "+4,800,000", "inc", dot="#2F855A")
)

# ---------------- 홈 A · 결과 하나 ----------------
home_a = "\n".join([
    hdr_home(),
    '<div class="hero"><span class="cap">2026.09.11 기준</span><span class="lbl">총자산</span>'
    '<div class="n44">128,450,000<span class="won">원</span></div>'
    '<div class="delta"><span class="d up">▲ 3,240,000</span><span class="c">+2.6% · 지난달보다</span></div></div>',
    SPARK,
    '<div class="hr"></div>',
    sec("이번 달 늘어난 이유", "자세히"),
    row("순저축", '<span class="inc">수입 4,800,000</span>&nbsp;−&nbsp;<span class="exp">지출 3,000,000</span>', "+1,800,000", "", bar=(56, "#647A5C")),
    row("투자손익", "평가 +1,120,000 · 실현 +320,000", "+1,440,000", "up", bar=(44, "#DC2626")),
    '<div class="hr"></div>',
    sec("자산 구성"),
    row("주식·ETF", None, "100,000,000", "", bar=(78, "#647A5C")),
    row("현금·예금", None, "28,450,000", "", bar=(22, "#C2674A")),
    '<div class="hr"></div>',
    sec("최근 기록"),
    RECENT,
])

# ---------------- 홈 B · 왜가 주인공 ----------------
home_b = "\n".join([
    hdr_home(),
    '<div class="r" style="border:0;height:40px;margin-top:8px"><div class="l"><div class="lbl">총자산</div></div><div class="rt"><div class="v" style="font-size:15px">128,450,000<span class="won">원</span></div></div></div>',
    '<div class="hero" style="padding-top:16px"><span class="cap">2026.09.11 기준 · 지난달 125,210,000</span><span class="lbl">이번 달 늘어난 돈</span>'
    '<div class="n44 up">▲ 3,240,000</div>'
    '<div class="delta"><span class="d up" style="font-size:16px">+2.6%</span><span class="c">지난달보다</span></div></div>',
    '<div class="hr"></div>',
    sec("어디서 늘었나", "자세히"),
    row("순저축", '<span class="inc">수입 4,800,000</span>&nbsp;−&nbsp;<span class="exp">지출 3,000,000</span>', "+1,800,000", "v18", bar=(56, "#647A5C"), h="big"),
    row("투자 평가손익", "삼성전자 · TIGER S&amp;P500 · 외 3", "+1,120,000", "v18 up", bar=(35, "#DC2626"), h="big"),
    row("실현손익", "9월 매도 2건", "+320,000", "v18 up", bar=(10, "#DC2626"), h="big"),
    '<div class="hr"></div>',
    stat3([("수입", "4,800,000", "inc"), ("지출", "3,000,000", "exp"), ("저축률", "37.5%", "")]),
    '<div class="hr"></div>',
    sec("최근 기록"),
    RECENT,
])

# ---------------- 홈 C · 추이가 주인공 ----------------
home_c = "\n".join([
    hdr_home(),
    '<div class="hero compact"><span class="lbl">총자산 · <span class="cap">2026.09.11</span></span>'
    '<div class="n28">128,450,000<span class="won">원</span><span class="mono up" style="font-size:14px;font-weight:600;margin-left:6px">▲ 2.6%</span></div></div>',
    chart12([120, 112, 116, 104, 98, 102, 88, 84, 78, 70, 52, 30], True, "128.45M"),
    '<div class="chips"><span>3개월</span><span>6개월</span><span class="on">12개월</span><span>전체</span></div>',
    '<div class="hr"></div>',
    stat3([("이번 달 저축", "+1,800,000", ""), ("투자손익", "+1,440,000", "up"), ("저축률", "37.5%", "")]),
    '<div class="hr"></div>',
    sec("자산 구성"),
    row("주식·ETF", None, "100,000,000", "", bar=(78, "#647A5C"), sub="78%"),
    row("현금·예금", None, "28,450,000", "", bar=(22, "#C2674A"), sub="22%"),
    '<div class="hr"></div>',
    sec("최근 기록"),
    row("스타벅스", "카페 · 9.11 · 신한 체크", "−5,600", "exp", dot="#C2674A"),
])

# ---------------- 투자 A ----------------
inv_a = "\n".join([
    hdr_invest(),
    '<div class="hero"><span class="cap">2026.09.11 15:30 시세</span><span class="lbl">평가금액</span>'
    '<div class="n44">100,000,000<span class="won">원</span></div>'
    '<div class="delta"><span class="d up">▲ 1,440,000</span><span class="c">+1.46% · 매입 98,560,000</span></div></div>',
    '<div class="hr"></div>',
    sec("계좌", "전체"),
    row("테스트증권", "3종목 · 현금 2,300,000", "72,000,000", "", sub='<span class="up">▲ 1.9%</span>', h="tall"),
    row("키움 ISA", "2종목 · 현금 0", "28,000,000", "", sub='<span class="down">▼ 0.4%</span>', h="tall"),
    '<div class="hr"></div>',
    sec("종목 비중"),
    row("삼성전자", None, "42,000,000", "", bar=(42, "#647A5C"), sub="42%"),
    row("TIGER 미국S&amp;P500", None, "31,000,000", "", bar=(31, "#C2674A"), sub="31%"),
    row("외 3개", None, "22,000,000", "", bar=(22, "#3C3530"), sub="22%"),
    row("현금", None, "5,000,000", "", bar=(5, "#A99C8D"), sub="5%"),
])

# ---------------- 투자 B ----------------
inv_b = "\n".join([
    hdr_invest(),
    '<div class="hero"><span class="cap">2026.09.11 15:30 시세</span><span class="lbl">평가손익</span>'
    '<div class="n44 up">▲ 1,440,000</div>'
    '<div class="delta"><span class="d up" style="font-size:16px">+1.46%</span><span class="c">평가 100,000,000 · 매입 98,560,000</span></div></div>',
    '<div class="hr"></div>',
    sec("종목별 손익", "전체"),
    row("삼성전자", "500주 · 84,000", "+1,250,000", "v18 up", sub="+3.1%", h="big"),
    row("TIGER 미국S&amp;P500", "1,200주 · 25,830", "+410,000", "v18 up", sub="+1.3%", h="big"),
    row("NAVER", "40주 · 210,000", "−220,000", "v18 down", sub="−2.6%", h="big"),
    '<div class="hr"></div>',
    sec("계좌"),
    row("테스트증권", "3종목", "72,000,000", "", sub='<span class="up">▲ 1.9%</span>', h="tall"),
    row("키움 ISA", "2종목", "28,000,000", "", sub='<span class="down">▼ 0.4%</span>', h="tall"),
])

# ---------------- 투자 C ----------------
inv_c = "\n".join([
    hdr_invest(),
    '<div class="hero compact"><span class="lbl">평가금액 · <span class="cap">15:30 시세</span></span>'
    '<div class="n28">100,000,000<span class="won">원</span><span class="mono up" style="font-size:14px;font-weight:600;margin-left:6px">▲ 1.46%</span></div></div>',
    chart12([110, 118, 100, 96, 104, 90, 86, 92, 74, 66, 58, 40], True, "100.0M"),
    '<div class="chips"><span>1개월</span><span>3개월</span><span class="on">12개월</span><span>전체</span></div>',
    '<div class="hr"></div>',
    stat3([("평가손익", "+1,440,000", "up"), ("매입금액", "98,560,000", ""), ("현금", "2,300,000", "")]),
    '<div class="hr"></div>',
    sec("계좌"),
    row("테스트증권", "3종목 · 현금 2,300,000", "72,000,000", "", sub='<span class="up">▲ 1.9%</span>', h="tall"),
    row("키움 ISA", "2종목 · 현금 0", "28,000,000", "", sub='<span class="down">▼ 0.4%</span>', h="tall"),
    '<div class="hr"></div>',
    sec("종목 비중"),
    row("삼성전자", None, "42,000,000", "", bar=(42, "#647A5C"), sub="42%"),
    row("TIGER 미국S&amp;P500", None, "31,000,000", "", bar=(31, "#C2674A"), sub="31%"),
])

FILES = {
    "Main.dc.html": page(home_a, "홈"),
    "HomeB.dc.html": page(home_b, "홈"),
    "HomeC.dc.html": page(home_c, "홈"),
    "InvestA.dc.html": page(inv_a, "투자", fab=False),
    "InvestB.dc.html": page(inv_b, "투자", fab=False),
    "InvestC.dc.html": page(inv_c, "투자", fab=False),
}
for name, html in FILES.items():
    (OUT / name).write_text(html, encoding="utf-8")

W, H, GX, GY = 390, 844, 110, 160
canvas = {
    "artboards": [
        {"file": "Main.dc.html", "x": 0, "y": 0, "w": W, "h": H, "title": "A · 결과 하나 — 홈"},
        {"file": "HomeB.dc.html", "x": W + GX, "y": 0, "w": W, "h": H, "title": "B · 왜가 주인공 — 홈"},
        {"file": "HomeC.dc.html", "x": 2 * (W + GX), "y": 0, "w": W, "h": H, "title": "C · 추이가 주인공 — 홈"},
        {"file": "InvestA.dc.html", "x": 0, "y": H + GY, "w": W, "h": H, "title": "A — 투자"},
        {"file": "InvestB.dc.html", "x": W + GX, "y": H + GY, "w": W, "h": H, "title": "B — 투자"},
        {"file": "InvestC.dc.html", "x": 2 * (W + GX), "y": H + GY, "w": W, "h": H, "title": "C — 투자"},
    ],
    "annotations": [
        {"id": "hyp-a", "x": 0, "y": -230, "w": 390, "text": "A · 결과 하나 (추천)\n총자산 + ▲변화액이 가장 큼. 토스식 — 10초 안에 '늘었나' 답.\n트레이드오프: '왜' 는 두 번째 스크롤 단위, 추이는 스파크라인 44px 뿐."},
        {"id": "hyp-b", "x": W + GX, "y": -230, "w": 390, "text": "B · 왜가 주인공\n이번 달 늘어난 돈(▲3,240,000)을 44px 로, 총자산은 위에 15px.\n기여 3행(순저축·평가손익·실현손익)이 hero 바로 아래.\n트레이드오프: 총자산 절대값이 작아져 '내 돈이 얼마' 가 한 번 더 걸림."},
        {"id": "hyp-c", "x": 2 * (W + GX), "y": -230, "w": 390, "text": "C · 추이가 주인공\n12개월 그래프 160px 가 가장 큼, 숫자는 28px.\n'매월 어떻게 변하는지' (activeContext Goal) 에 가장 직접적.\n트레이드오프: 오늘의 변화액이 작고, 스냅샷 0~2개일 땐 그래프가 비어 보임."},
        {"id": "common", "x": 0, "y": 2 * H + GY + 60, "w": 900, "text": "공통: 카드 0장 · 헤어라인 · Geist Mono 금액 · 색은 방향에만(수입 초록 / 지출 테라코타 / 상승 빨강 / 하락 파랑 / 행동 세이지) · '＋ 기록' 40px 은 홈·거래 탭에서만 · 헤더 48(브랜드 + 가계부 pill) · 탭바 64.\n폰트는 캔버스 제약으로 Noto Sans KR 대역(실제 = Pretendard). 데스크톱(720+320)·거래·내정보는 선택 후 프로토타입에서."},
    ],
    "launch": {"view": "canvas"},
}
(OUT / "canvas.json").write_text(json.dumps(canvas, ensure_ascii=False, indent=2), encoding="utf-8")
print("ok", list(FILES))
