# -*- coding: utf-8 -*-
"""배치2 handoff 생성기 — 가설 A+C 확장. 배치1 gen.py 의 CSS·헬퍼를 그대로 재사용(exec).
화면: invest/account · invest/portfolio · transactions/new(시트) · wealth × 390/1440 + 상태.
실행: python3 gen.py → *.dc.html + canvas.json  (번들은 S5 참조용, 코드에 붙이지 않는다)
"""
import json, pathlib
OUT = pathlib.Path(__file__).parent
_src = (OUT.parent / "1" / "gen.py").read_text(encoding="utf-8")
exec(_src[: _src.index("TX = [")])
OUT = pathlib.Path(__file__).parent  # exec 가 덮은 OUT 복원

CSS = CSS + """
.cbar{display:flex;height:6px;border-radius:3px;overflow:hidden;background:var(--hair2);margin:6px 0}
.cbar i{display:block;height:6px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0 4px}
.two .btn.outline{font-size:15px}
.field{display:flex;flex-direction:column;gap:6px;margin-top:14px}
.field .fl{font-size:12px;font-weight:600;color:var(--dim)}
.field .input{min-width:0;width:100%}
.field .input.big{height:52px;font-family:var(--mono);font-size:28px;font-weight:700;justify-content:flex-end;letter-spacing:-0.03em}
.field .input.big .won{font-size:14px;margin-left:6px}
.sheet{position:absolute;left:0;right:0;bottom:0;background:var(--surface);border-radius:16px 16px 0 0;padding:4px 20px 0;box-shadow:0 20px 40px rgba(0,0,0,.24);display:flex;flex-direction:column}
.handle{width:40px;height:4px;border-radius:2px;background:var(--hair);margin:8px auto 10px}
.sheet .st{font-size:16px;font-weight:800;letter-spacing:-0.03em}
.foot{display:grid;grid-template-columns:1fr 2fr;gap:10px;padding:16px 0 calc(64px + 16px);margin-top:8px}
.scrim{position:absolute;inset:0;background:rgba(0,0,0,.6)}
.modal{width:560px;background:var(--surface);border-radius:12px;padding:20px 24px 4px;margin:80px auto 0;box-shadow:0 20px 40px rgba(0,0,0,.24)}
.modal .foot{padding-bottom:20px}
.hint{font-family:var(--mono);font-size:11px;color:var(--dim);letter-spacing:.02em}
.stack{display:flex;flex-direction:column}
.chart,.cbar,.axis,.chips,.stat,.two,.field,.sec,.hero,.dh,.seg,.empty{flex-shrink:0}
"""

C1, C2, C3, C4, C5 = "#647A5C", "#C2674A", "#3C3530", "#A99C8D", "#DDD5C9"

def cbar(segs):
    return '<div class="cbar">' + "".join(f'<i style="width:{w}%;background:{c}"></i>' for w, c in segs) + "</div>"

def sub_hdr(title, act=""):
    a = f'<a style="font-size:13px;font-weight:700">{act}</a>' if act else ""
    return f'<div class="hdr"><span style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700"><span class="acc">←</span>{title}</span>{a}</div>'

def hero28(label, amount, delta, dcls, cap, caption=None):
    c = f'<div class="cap">{caption}</div>' if caption else ""
    return (f'<div class="hero compact">{c}<div class="lbl">{label}</div><div class="n28">{amount}<span class="won">원</span></div>'
            f'<div class="delta"><span class="d {dcls}">{delta}</span><span class="c">{cap}</span></div></div>')

def line_chart(points, h=140, color=C1, end=None, axis=None):
    n = len(points); step = 350 / (n - 1)
    pts = " ".join(f"{i*step:.1f},{y}" for i, y in enumerate(points))
    lx, ly = (n - 1) * step, points[-1]
    dot = f'<circle cx="{lx:.1f}" cy="{ly}" r="3" fill="{end or C1}"/>'
    ax = ('<div class="axis">' + "".join(f"<span>{a}</span>" for a in axis) + "</div>") if axis else ""
    return (f'<svg class="chart" style="height:{h}px" viewBox="0 0 350 160" preserveAspectRatio="none">'
            f'<polyline fill="none" stroke="{color}" stroke-width="1.5" points="{pts}"/>{dot}</svg>{ax}')

def stacked_area(h=200):
    # 12개월 자산군 적층 — 아래부터 부동산(chart3) · 현금(chart2) · 연금(chart4) · 투자(chart1) · 기타(chart5)
    xs = [i * 31.8 for i in range(12)]
    layers = [(C3, [0.62]*12), (C2, [0.10,0.10,0.09,0.09,0.08,0.08,0.08,0.07,0.07,0.07,0.06,0.06]),
              (C4, [0.06]*12), (C1, [0.02,0.02,0.03,0.03,0.04,0.05,0.06,0.08,0.10,0.11,0.12,0.13]), (C5, [0.01]*12)]
    base = [0.0]*12; polys = []
    for col, vals in layers:
        top = [base[i] + vals[i] for i in range(12)]
        up = " ".join(f"{xs[i]:.1f},{160 - top[i]*150:.1f}" for i in range(12))
        down = " ".join(f"{xs[i]:.1f},{160 - base[i]*150:.1f}" for i in reversed(range(12)))
        polys.append(f'<polygon points="{up} {down}" fill="{col}" fill-opacity=".9"/>')
        base = top
    return (f'<svg class="chart" style="height:{h}px" viewBox="0 0 350 160" preserveAspectRatio="none">' + "".join(polys) + '</svg>'
            '<div class="axis"><span>10</span><span>11</span><span>12</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div>')

def field(label, value, big=False, hint=None, dim=False):
    cls = "input big" if big else "input"
    v = f'{value}<span class="won">원</span>' if big else f'<span class="{"dim" if dim else ""}">{value}</span>{CHEV_D if not big else ""}'
    hh = f'<div class="hint">{hint}</div>' if hint else ""
    return f'<div class="field"><div class="fl">{label}</div><div class="{cls}">{v}</div>{hh}</div>'

# ---------- 종목 비중·보유 종목 공용 ----------
SHARES = (cbar([(43, C1), (29, C2), (28, C3)])
          + row("KODEX 미국우주항공", None, "984,960", "", sub="43%", dot=C1)
          + row("KODEX 미국나스닥100", None, "679,250", "", sub="29%", dot=C2)
          + row("TIGER 토탈월드스탁액티브", None, "639,000", "", sub="28%", dot=C3)
          + row("현금", None, "12,256", "", sub="1%", dot=C5))
HOLD = (row("TIGER 토탈월드스탁액티브", "0060H0 · 코스피 · 50주 · 평균 12,418", "639,000", "", sub='<span class="up">+18,100 (▲ 2.92%)</span>', h="tall", chev=True)
        + row("KODEX 미국나스닥100", "379810 · 코스피 · 25주 · 평균 25,263", "679,250", "", sub='<span class="up">+47,675 (▲ 7.55%)</span>', h="tall", chev=True)
        + row("KODEX 미국우주항공", "0167Z0 · 코스피 · 114주 · 평균 10,753", "984,960", "", sub='<span class="down">−240,882 (▼ 19.65%)</span>', h="tall", chev=True))
REALIZED = row("누적 매매수익", "전체 매도기간 · 매도 1건", "−10,744", "down", sub='<span class="down">−99.92%</span>', h="tall", chev=True)
ACC_TREND = sec("자산 추이", '<span class="cap up">최근 8개월 +7.4%</span>') + line_chart([120, 118, 110, 104, 100, 96, 80, 60], h=120, end="#DC2626", axis=["1","2","3","4","5","6","7","8"])

# ---------- invest/account ----------
acc_m = "\n".join([
    hdr_home(), sub_hdr("신연금저축"),
    hero28("계좌 총액", "2,315,466", "▼ 175,107", "down", '<span class="mono">−7.1%</span> · 평가손익'),
    stat3([("현금", "12,256", ""), ("평가", "2,303,210", ""), ("종목", "3개", "")]),
    '<div class="hr"></div>', ACC_TREND,
    '<div class="hr"></div>', sec("종목 비중", ""), SHARES,
    '<div class="hr"></div>', sec("보유 종목", "+ 종목 추가"), HOLD,
])
acc_d_col = "\n".join([sub_hdr("신연금저축"), hero28("계좌 총액", "2,315,466", "▼ 175,107", "down", '<span class="mono">−7.1%</span> · 평가손익'),
    stat3([("현금", "12,256", ""), ("평가", "2,303,210", ""), ("종목", "3개", "")]), '<div class="hr"></div>', ACC_TREND,
    '<div class="hr"></div>', sec("보유 종목", "+ 종목 추가"), HOLD])
acc_d_rail = "\n".join(['<div class="hr"></div>', sec("종목 비중", ""), SHARES, '<div class="hr"></div>', REALIZED])

# ---------- invest/portfolio (종목 상세) ----------
TRADES = ('<div class="dh">08.21 THU</div>' + row("매수", "50주 × 12,418", "620,900", "up", tag=None)
          + '<div class="dh">06.03 TUE</div>' + row("매도", "10주 × 12,100 · 실현 −10,744", "121,000", "down")
          + '<div class="dh">03.14 FRI</div>' + row("매수", "60주 × 12,900", "774,000", "up"))
stock_hero = hero28("평가금액", "639,000", "▲ 18,100", "up", '<span class="mono">+2.92%</span> · 평가손익', caption="0060H0 · 코스피")
stock_stat = stat3([("보유수량", "50주", ""), ("평균단가", "12,418", ""), ("현재가", "12,780", "")])
stock_chart = sec("평가액 추이", "") + line_chart([120, 118, 122, 110, 100, 96, 88, 84, 80, 70, 66, 60], h=140, end="#DC2626", axis=list("10 11 12 1 2 3 4 5 6 7 8 9".split())) + '<div class="chips"><span>1개월</span><span>3개월</span><span class="on">12개월</span><span>전체</span></div>'
buy_sell = '<div class="two"><div class="btn outline up">매수</div><div class="btn outline down">매도</div></div>'
stock_m = "\n".join([hdr_home(), sub_hdr("TIGER 토탈월드스탁액티브", "수정"), stock_hero, stock_stat, '<div class="hr"></div>', stock_chart, buy_sell, '<div class="hr"></div>', sec("매매 내역", ""), TRADES])
stock_d_col = "\n".join([sub_hdr("TIGER 토탈월드스탁액티브", "수정"), stock_hero, stock_stat, '<div class="hr"></div>', stock_chart, '<div class="hr"></div>', sec("매매 내역", ""), TRADES])
stock_d_rail = "\n".join(['<div class="hr"></div>', buy_sell, '<div class="hr"></div>', sec("요약", ""), row("매입금액", None, "620,900", ""), row("실현손익 누적", None, "−10,744", "down"), row("매매 횟수", None, "3회", "")])

# ---------- transactions/new — 시트 ----------
form_body = ('<div class="seg"><span class="on">지출</span><span>수입</span><span>이체</span></div>'
             + field("금액", "5,600", big=True)
             + field("통장", "신한 체크", hint="현재 잔액 1,234,000원")
             + field("카테고리", '<span style="display:flex;align-items:center;gap:6px"><span class="dot" style="background:#C2674A"></span>카페</span>')
             + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' + field("날짜", "2026.09.12") + field("메모", "선택", dim=True) + '</div>'
             + '<div class="foot"><div class="btn outline">취소</div><div class="btn filled">추가</div></div>')
sheet_m = wrap('<div class="phone"><div class="body">' + hdr_home() + hdr_title("거래") + '<div class="empty">뒤 화면은 거래 목록 그대로</div></div>'
               + '<div class="scrim"></div><div class="sheet"><div class="handle"></div><div class="st">거래 추가</div>' + form_body + '</div>' + tab("거래") + '</div>')
transfer_body = ('<div class="seg"><span>지출</span><span>수입</span><span class="on">이체</span></div>' + field("금액", "500,000", big=True)
                 + field("보내는 통장", "국민 급여통장", hint="현재 잔액 4,120,000원") + field("받는 통장", "카카오 세이프박스")
                 + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' + field("날짜", "2026.09.12") + field("메모", "선택", dim=True) + '</div>'
                 + '<div class="foot"><div class="btn outline">취소</div><div class="btn filled">추가</div></div>')
valuation_body = ('<div class="hint" style="margin-top:12px">투자통장 — 평가조정 자동 분기</div>'
                  + field("방향", "증가") + field("금액", "120,000", big=True) + field("통장", "토스 증권", hint="새 평가액 1,770,833원 (현재 1,650,833)")
                  + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' + field("날짜", "2026.09.12") + field("메모", "선택", dim=True) + '</div>'
                  + '<div class="foot"><div class="btn outline">취소</div><div class="btn filled">추가</div></div>')
sheet_variants = wrap('<div class="phone"><div class="body">' + hdr_home() + hdr_title("거래") + '</div>'
                      + '<div class="scrim"></div><div class="sheet" style="max-height:760px"><div class="handle"></div><div class="st">거래 추가 · 이체</div>' + transfer_body + '</div>' + tab("거래") + '</div>')
sheet_valuation = wrap('<div class="phone"><div class="body">' + hdr_home() + hdr_title("거래") + '</div>'
                       + '<div class="scrim"></div><div class="sheet"><div class="handle"></div><div class="st">거래 추가 · 평가조정</div>' + valuation_body + '</div>' + tab("거래") + '</div>')
sheet_d = wrap('<div class="desk" style="position:relative"><div class="side"></div><div class="main"></div><div class="scrim"></div>'
               '<div class="modal" style="position:absolute;left:50%;top:0;transform:translateX(-50%)"><div class="st" style="font-size:16px;font-weight:800">거래 추가</div>' + form_body + '</div></div>')

# ---------- wealth ----------
ALLOC = (cbar([(83, C3), (8, C2), (6, C4), (2, C1), (1, C5)])
         + row("부동산", None, "620,000,000", "", sub="83%", dot=C3) + row("현금", None, "62,782,349", "", sub="8%", dot=C2)
         + row("연금", None, "48,000,000", "", sub="6%", dot=C4) + row("투자", None, "16,055,830", "", sub="2%", dot=C1) + row("적금", None, "100,000", "", sub="0%", dot=C5))
ASSETS = (row("우리집 아파트", "부동산 · 2026.08 갱신", "620,000,000", "", h="tall", chev=True)
          + row("국민연금", "연금 · 2026.08 갱신", "48,000,000", "", h="tall", chev=True)
          + row("금 10돈", "금 · 2026.07 갱신", "5,694,000", "", h="tall", chev=True))
ACCTS = (row("국민 급여통장", "은행", "4,120,000", "", h="tall", chev=True) + row("신한 체크", "은행", "1,234,000", "", h="tall", chev=True)
         + row("토스 증권", "증권 · 0종목 · 현금 1,650,833", "1,650,833", "", h="tall", chev=True) + row("ISA통장", "증권 · 3종목", "13,767,179", "", h="tall", chev=True))
TREND = sec("배분 추이", '<span class="cap">12개월</span>') + stacked_area(200)
wealth_m = "\n".join([hdr_home(), hdr_title("자산", '<a style="font-size:13px;font-weight:700">+ 자산 추가</a>'),
    '<div style="height:8px"></div>', sec("자산 구성", ""), ALLOC, '<div class="hr"></div>', TREND,
    '<div class="hr"></div>', sec("자산", "+ 추가"), ASSETS, '<div class="hr"></div>', sec("통장", "+ 통장 추가"), ACCTS])
wealth_d_col = "\n".join([hdr_title("자산", '<a style="font-size:13px;font-weight:700">+ 자산 추가</a>'), '<div class="hr"></div>', TREND, '<div class="hr"></div>', sec("통장", "+ 통장 추가"), ACCTS])
wealth_d_rail = "\n".join(['<div class="hr"></div>', sec("자산 구성", ""), ALLOC, '<div class="hr"></div>', sec("자산", "+ 추가"), ASSETS])

# ---------- 상태 ----------
states = "\n".join([hdr_home(), hdr_title("배치2 상태 3종"),
    '<div class="statebox"><div class="h">빈 — 종목 0 · 매매 0 · 자산 0</div>' + sec("보유 종목", "+ 종목 추가") + '<div class="empty">보유 종목이 없어요 <a>종목 추가</a></div>'
    + '<div class="hr"></div>' + sec("매매 내역", "") + '<div class="empty">첫 매수를 기록해요 <a>매수</a></div>'
    + '<div class="hr"></div>' + sec("자산", "+ 추가") + '<div class="empty">등록된 자산이 없어요 <a>추가</a></div></div>',
    '<div class="statebox"><div class="h">로딩 — hero 28 + 행 3 스켈레톤</div><div class="skel" style="width:60px;height:13px"></div><div class="skel" style="width:180px;height:28px;margin-top:8px"></div>'
    '<div class="r"><div class="skel" style="width:120px;height:14px"></div><div class="skel" style="width:80px;height:14px"></div></div>'
    '<div class="r"><div class="skel" style="width:90px;height:14px"></div><div class="skel" style="width:96px;height:14px"></div></div></div>',
    '<div class="statebox"><div class="h">에러 — 섹션 인라인 · 제출 실패는 토스트</div>' + sec("평가액 추이", "") + '<div class="empty">불러오지 못했어요 <a>다시 시도</a></div>'
    + '<div class="field"><div class="fl">금액</div><div class="input big" style="border:1px solid var(--danger)">0<span class="won">원</span></div><div class="hint" style="color:var(--danger)">금액을 입력해 주세요</div></div></div>',
])

FILES = {
    "Main.dc.html": phone(acc_m, "투자", fab=False),
    "Stock.dc.html": phone(stock_m, "투자", fab=False),
    "RecordSheet.dc.html": sheet_m,
    "RecordSheetTransfer.dc.html": sheet_variants,
    "RecordSheetValuation.dc.html": sheet_valuation,
    "Wealth.dc.html": phone(wealth_m, "홈", fab=False),
    "States.dc.html": phone(states, "투자", fab=False),
    "AccountDesktop.dc.html": desk(acc_d_col, acc_d_rail, "투자"),
    "StockDesktop.dc.html": desk(stock_d_col, stock_d_rail, "투자"),
    "RecordModalDesktop.dc.html": sheet_d,
    "WealthDesktop.dc.html": desk(wealth_d_col, wealth_d_rail, "홈"),
}
for name, html in FILES.items():
    (OUT / name).write_text(html, encoding="utf-8")

W, H, DW, DH, GX, GY = 390, 844, 1440, 900, 110, 160
mob = ["Main.dc.html", "Stock.dc.html", "RecordSheet.dc.html", "RecordSheetTransfer.dc.html", "RecordSheetValuation.dc.html", "Wealth.dc.html", "States.dc.html"]
titles = {"Main.dc.html": "invest/account · 390", "Stock.dc.html": "invest/portfolio · 390", "RecordSheet.dc.html": "transactions/new · 지출", "RecordSheetTransfer.dc.html": "transactions/new · 이체", "RecordSheetValuation.dc.html": "transactions/new · 평가조정", "Wealth.dc.html": "wealth · 390", "States.dc.html": "상태 3종"}
desks = ["AccountDesktop.dc.html", "StockDesktop.dc.html", "RecordModalDesktop.dc.html", "WealthDesktop.dc.html"]
canvas = {"artboards": [{"file": f, "x": i * (W + GX), "y": 0, "w": W, "h": H, "title": titles[f]} for i, f in enumerate(mob)]
          + [{"file": f, "x": (i % 2) * (DW + GX), "y": H + GY + (i // 2) * (DH + GY), "w": DW, "h": DH, "title": f.replace(".dc.html", " · 1440")} for i, f in enumerate(desks)],
          "annotations": [{"id": "pick2", "x": 0, "y": -200, "w": 560, "text": "배치2 handoff — 가설 A+C 확장. 계좌 상세·종목 상세는 28px compact hero + StatGrid + 추이 + 행. 거래 기록은 시트(모바일)/모달 560(데스크톱) 하나로 지출·수입·이체·평가조정 분기. 자산은 구성 막대 + 적층 배분 추이 + 자산/통장 행."}],
          "launch": {"view": "canvas"}}
(OUT / "canvas.json").write_text(json.dumps(canvas, ensure_ascii=False, indent=2), encoding="utf-8")
print("ok", len(FILES))
