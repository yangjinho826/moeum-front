# -*- coding: utf-8 -*-
"""배치3 handoff 생성기 — 가설 A+C 확장. 배치1·2 gen.py 의 CSS·헬퍼를 재사용(exec, 파일 쓰기 전까지만).
화면: account/[accountId] × 390/1440 · 통장 폼(시트 추가/수정 · 페이지 모드 1440) · 매매 시트(매수/매도 수정) + 상태.
색은 배치2 S6 H-1 이후 라이트 값(sage.7 · positive.6 · terracotta.7 · danger.7 · info.6).
실행: python3 gen.py → *.dc.html + canvas.json  (번들은 S5 참조용, 코드에 붙이지 않는다)
"""
import json, pathlib
OUT3 = pathlib.Path(__file__).parent
_src2 = (OUT3.parent / "2" / "gen.py").read_text(encoding="utf-8")
__file__ = str(OUT3.parent / "2" / "gen.py")  # 배치2 가 배치1 경로를 __file__ 기준으로 찾는다
exec(_src2[: _src2.index("# ---------- 종목 비중")])
OUT = OUT3

C1, C2 = "#4F6149", "#A4543B"
UP, DOWN, INC, EXP = "#B91C1C", "#2563EB", "#266E4A", "#A4543B"
CSS = CSS + f"""
:root{{--accent:{C1};--up:{UP};--down:{DOWN};--income:{INC};--expense:{EXP};--chart2:{C2};--danger:#B91C1C}}
a:hover{{color:#3F4F3A}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}
.field .desc{{font-size:12px;color:var(--dim)}}
.field .input.num{{font-family:var(--mono);font-size:15px;font-weight:600;justify-content:space-between}}
.field .input.num .won{{font-size:13px}}
.field .input.lock{{opacity:.55}}
.sw{{display:grid;grid-template-columns:repeat(6,28px);gap:12px 16px;padding:2px}}
.sw i{{width:28px;height:28px;border-radius:14px;display:block}}
.sw i.on{{outline:2px solid var(--text);outline-offset:2px}}
.ig{{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}}
.ig span{{height:36px;border-radius:8px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--dim)}}
.ig span.on{{background:var(--accent-soft);color:var(--accent)}}
.ig svg{{width:18px;height:18px}}
.sum{{border-top:1px solid var(--hair2);margin-top:14px;padding-top:8px}}
.sum .sr{{display:flex;justify-content:space-between;align-items:baseline;height:26px}}
.sum .sr .k{{font-size:13px;color:var(--dim)}}
.sum .sr .v{{font-family:var(--mono);font-size:13px;font-variant-numeric:tabular-nums}}
.sum .sr.total .k{{color:var(--text);font-weight:600}}
.sum .sr.total .v{{font-size:15px;font-weight:700}}
.foot3{{display:flex;gap:10px;align-items:center;padding:16px 0 calc(64px + 16px);margin-top:8px}}
.foot3 .del{{height:44px;padding:0 12px;margin-left:-12px;display:flex;align-items:center;font-size:15px;font-weight:700;color:var(--danger)}}
.foot3 .btn{{flex:1 1 0}}
.foot3 .btn.filled{{flex:2 1 0}}
.foot3 .btn.outline{{flex:1 1 0}}
.foot3.page{{padding-bottom:0}}
.field .input.big{{justify-content:space-between}}
.fhint{{padding-top:8px}}
.fhint{{font-size:12px;color:var(--dim);margin-top:-10px;padding-bottom:12px}}
.seg span.up{{color:var(--up)}}.seg span.down{{color:var(--down)}}
.seg.lock{{opacity:.55}}
.pagef{{max-width:560px}}
.chart,.axis,.stat,.field,.sec,.hero,.dh,.seg,.empty,.sw,.ig,.sum,.grid2,.foot3{{flex-shrink:0}}
"""

def line_n(points, h, end, axis):
    return line_chart(points, h=h, end=end, axis=axis).replace('<div class="axis">', f'<div class="axis" style="grid-template-columns:repeat({len(axis)},minmax(0,1fr))">')

def num(label, value, unit="원", desc=None, lock=False):
    d = f'<div class="desc">{desc}</div>' if desc else ""
    return (f'<div class="field"><div class="fl">{label}</div>'
            f'<div class="input num{" lock" if lock else ""}"><span>{value}</span><span class="won">{unit}</span></div>{d}</div>')

def text_field(label, value, dim=False, chev=False):
    c = CHEV_D if chev else ""
    return f'<div class="field"><div class="fl">{label}</div><div class="input"><span class="{"dim" if dim else ""}">{value}</span>{c}</div></div>'

def seg_field(label, items, on, cls=None, lock=False):
    spans = "".join(f'<span class="{" ".join(x for x in [("on" if i == on else ""), (cls[i] if cls else "")] if x)}">{t}</span>' for i, t in enumerate(items))
    return f'<div class="field"><div class="fl">{label}</div><div class="seg{" lock" if lock else ""}">{spans}</div></div>' if label else f'<div class="seg{" lock" if lock else ""}" style="margin-top:12px">{spans}</div>'

def foot(submit, delete=False, page=False):
    d = '<div class="del">삭제</div>' if delete else ""
    return f'<div class="foot3{" page" if page else ""}">{d}<div class="btn outline">취소</div><div class="btn filled">{submit}</div></div>'

PALETTE = ["#3B82F6", "#2F855A", "#EF4444", "#8B5CF6", "#FCD34D", "#D97706", "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#0046FF", "#8B95A1"]
ICON_PATHS = [
    '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h2"/>', '<path d="M3 11l9-8 9 8v10H3z"/>',
    '<rect x="5" y="3" width="14" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2"/>', '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3"/>',
    '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/>', '<path d="M5 16V11l2-5h10l2 5v5z"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/>',
    '<rect x="5" y="3" width="14" height="15" rx="2"/><path d="M5 11h14M8 21v-3M16 21v-3"/>', '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>', '<rect x="4" y="9" width="16" height="11"/><path d="M12 9v11M4 13h16"/>',
    '<path d="M3 17l6-6 4 4 8-8"/>', '<circle cx="12" cy="13" r="7"/><path d="M12 6V3"/>',
    '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>', '<rect x="7" y="3" width="10" height="18" rx="2"/>',
    '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M9 21h6"/>', '<path d="M6 9v6M18 9v6M3 12h18M9 7v10M15 7v10"/>',
]

def swatches(on=0):
    return '<div class="field"><div class="fl">색</div><div class="sw">' + "".join(f'<i class="{"on" if i == on else ""}" style="background:{c}"></i>' for i, c in enumerate(PALETTE)) + "</div></div>"

def icons(on=0):
    return '<div class="field"><div class="fl">아이콘</div><div class="ig">' + "".join(f'<span class="{"on" if i == on else ""}">{SVG}{p}</svg></span>' for i, p in enumerate(ICON_PATHS)) + "</div></div>"

def sheet(title, body, active="홈", h=None):
    mh = f' style="max-height:{h}px"' if h else ""
    return wrap('<div class="phone"><div class="body">' + hdr_home() + hdr_title("자산") + '</div>'
                + f'<div class="scrim"></div><div class="sheet"{mh}><div class="handle"></div><div class="st">{title}</div>{body}</div>' + tab(active) + '</div>')

# ---------- account/[accountId] — 통장 상세 ----------
MONTHS8 = ["2", "3", "4", "5", "6", "7", "8", "9"]
ACC_HERO = hero28("현재 잔액", "4,120,000", "▲ 620,000", "up", '<span class="mono">+17.7%</span> · 지난달보다')
ACC_STAT = stat3([("이번 달 수입", "4,800,000", "inc"), ("지출", "3,560,000", "exp"), ("고정지출", "620,000", "exp")])
ACC_TREND3 = sec("잔액 추이", '<span class="cap up">최근 8개월 +12.4%</span>') + line_n([110, 100, 120, 96, 104, 88, 96, 72], 120, UP, MONTHS8)
LEDGER = ('<div class="dh">09.11 THU</div>'
          + row("스타벅스", '<span class="dot" style="background:#A4543B"></span>카페', "−5,600", "exp", sub="잔액 4,120,000")
          + row("넷플릭스", '<span class="dot" style="background:#A4543B"></span>구독', "−17,000", "exp", sub="잔액 4,125,600", tag="고정")
          + '<div class="dh">09.10 WED</div>'
          + row("급여", '<span class="dot" style="background:#266E4A"></span>수입', "+4,800,000", "inc", sub="잔액 4,142,600")
          + row("비상금 이체", "→ 카카오 세이프박스", "500,000", "pur", sub="잔액 −657,400"))
acc_m = "\n".join([hdr_home(), sub_hdr("국민 급여통장", "수정"), ACC_HERO, ACC_STAT,
                   '<div class="hr"></div>', ACC_TREND3,
                   '<div class="hr"></div>', sec("거래 내역", ""), LEDGER])
acc_d_col = "\n".join([sub_hdr("국민 급여통장", "수정"), ACC_HERO, '<div class="hr"></div>', ACC_TREND3,
                       '<div class="hr"></div>', sec("거래 내역", ""), LEDGER])
acc_d_rail = "\n".join(['<div class="hr"></div>', sec("이번 달", ""), row("수입", None, "4,800,000", "inc"), row("지출", None, "3,560,000", "exp"), row("고정지출", None, "620,000", "exp")])

# ---------- 통장 폼 ----------
acc_form_new = (text_field("이름", "예: 국민 급여통장", dim=True)
                + seg_field("유형", ["생활", "적립", "투자"], 0)
                + num("시작 잔액", '<span class="dim">0</span>')
                + swatches(0) + icons(0) + foot("추가"))
acc_form_edit = (text_field("이름", "국민 급여통장")
                 + seg_field("유형", ["생활", "적립", "투자"], 0)
                 + num("시작 잔액", "1,200,000")
                 + swatches(10) + icons(0) + foot("저장", delete=True))
acc_page_d = desk(sub_hdr("통장 추가") + '<div class="pagef">' + acc_form_new.replace('class="foot3"', 'class="foot3 page"') + '</div>', "", "홈")

# ---------- 매매 시트 ----------
trade_new = (seg_field(None, ["매수", "매도"], 0, cls=["up", "down"])
             + '<div class="grid2">' + num("수량", "50", "주") + num("매수가", "12,418") + '</div>'
             + '<div class="grid2">' + num("수수료", "0", desc="매수 금액에 더해져요") + text_field("날짜", "2026.09.12", chev=True) + '</div>'
             + text_field("메모", "선택", dim=True)
             + '<div class="sum"><div class="sr"><span class="k">매수금액</span><span class="v">620,900원</span></div>'
               '<div class="sr"><span class="k">수수료</span><span class="v">+0원</span></div>'
               '<div class="sr total"><span class="k">정산금액</span><span class="v">620,900원</span></div></div>'
             + foot("매수 기록"))
trade_edit = (seg_field(None, ["매수", "매도"], 1, cls=["up", "down"], lock=True)
              + '<div class="grid2">' + num("수량", "10", "주") + num("매도가", "12,100") + '</div>'
              + '<div class="grid2">' + num("수수료", "250", desc="매도 금액에서 빠져요") + text_field("날짜", "2026.06.03", chev=True) + '</div>'
              + text_field("메모", "리밸런싱")
              + '<div class="sum"><div class="sr"><span class="k">매도금액</span><span class="v">121,000원</span></div>'
                '<div class="sr"><span class="k">수수료</span><span class="v">−250원</span></div>'
                '<div class="sr total"><span class="k">정산금액</span><span class="v">120,750원</span></div></div>'
              + foot("수정", delete=True))
def trade_sheet(title, body):
    return wrap('<div class="phone"><div class="body">' + hdr_home() + sub_hdr("TIGER 토탈월드스탁액티브", "수정") + '</div>'
                + f'<div class="scrim"></div><div class="sheet"><div class="handle"></div><div class="st">{title}</div>{body}</div>' + tab("투자") + '</div>')

# ---------- 상태 ----------
states = "\n".join([hdr_home(), hdr_title("배치3 상태"),
    '<div class="statebox"><div class="h">빈 — 거래 0 · 흐름 0</div>' + sec("거래 내역", "") + '<div class="empty">아직 거래가 없어요 <a>기록</a></div>'
    '<div class="note">박제 &lt;2 → 잔액 추이 숨김</div></div>',
    '<div class="statebox"><div class="h">로딩 — hero 28 + 행 3</div><div class="skel" style="width:60px;height:13px"></div><div class="skel" style="width:180px;height:28px;margin-top:8px"></div>'
    '<div class="r"><div class="skel" style="width:120px;height:14px"></div><div class="skel" style="width:80px;height:14px"></div></div>'
    '<div class="r"><div class="skel" style="width:90px;height:14px"></div><div class="skel" style="width:96px;height:14px"></div></div></div>',
    '<div class="statebox"><div class="h">에러 — 보조 섹션 인라인</div>' + sec("잔액 추이", "") + '<div class="empty">불러오지 못했어요 <a>다시 시도</a></div></div>',
    '<div class="statebox"><div class="h">평가조정 힌트 — 입력 전 / 후</div>'
    + '<div class="field"><div class="fl">새 평가액</div><div class="input big"><span class="dim">0</span><span class="won">원</span></div><div class="hint">현재 1,650,833원</div></div>'
    + '<div class="field"><div class="fl">새 평가액</div><div class="input big">1,770,833<span class="won">원</span></div><div class="hint">현재 1,650,833원 · <span class="up">증가 120,000원</span></div></div></div>',
    '<div class="statebox"><div class="h">삭제 불가 힌트 — 종목 수정</div>' + foot("저장", delete=True).replace('class="foot3"', 'class="foot3 page"').replace('class="del"', 'class="del" style="opacity:.4"') + '<div class="fhint">보유 수량이 있어 삭제할 수 없어요. 전량 매도 후 삭제해요</div></div>',
])

FILES = {
    "Main.dc.html": phone(acc_m, "홈", fab=False),
    "AccountSheet.dc.html": sheet("통장 추가", acc_form_new),
    "AccountSheetEdit.dc.html": sheet("통장 수정", acc_form_edit),
    "TradeSheet.dc.html": trade_sheet("매수 기록", trade_new),
    "TradeSheetEdit.dc.html": trade_sheet("매매 수정", trade_edit),
    "States.dc.html": phone(states, "홈", fab=False).replace('<div class="phone">', '<div class="phone" style="height:1180px">', 1),
    "AccountDesktop.dc.html": desk(acc_d_col, acc_d_rail, "홈"),
    "AccountPageDesktop.dc.html": acc_page_d,
}
for name, html in FILES.items():
    (OUT / name).write_text(html, encoding="utf-8")

W, H, DW, DH, GX, GY = 390, 844, 1440, 900, 110, 160
mob = ["Main.dc.html", "AccountSheet.dc.html", "AccountSheetEdit.dc.html", "TradeSheet.dc.html", "TradeSheetEdit.dc.html", "States.dc.html"]
titles = {"Main.dc.html": "account/[accountId] · 390", "AccountSheet.dc.html": "account/new · 시트", "AccountSheetEdit.dc.html": "account/[id]/edit · 시트(삭제 좌측)",
          "TradeSheet.dc.html": "매매 시트 · 매수", "TradeSheetEdit.dc.html": "매매 시트 · 수정(삭제 좌측)", "States.dc.html": "상태 · 힌트"}
desks = ["AccountDesktop.dc.html", "AccountPageDesktop.dc.html"]
dtitles = {"AccountDesktop.dc.html": "account/[accountId] · 1440", "AccountPageDesktop.dc.html": "account/new 페이지 모드 · 1440"}
canvas = {"artboards": [{"file": f, "x": i * (W + GX), "y": 0, "w": W, "h": 1180 if f == "States.dc.html" else H, "title": titles[f]} for i, f in enumerate(mob)]
          + [{"file": f, "x": i * (DW + GX), "y": 1180 + GY, "w": DW, "h": DH, "title": dtitles[f]} for i, f in enumerate(desks)],
          "annotations": [{"id": "pick3", "x": 0, "y": -200, "w": 620, "text": "배치3 handoff — 가설 A+C 확장. 통장 상세 = 28 compact hero(▲▼ 지난달) + 이번 달 StatGrid + 잔액 추이 + 거래 내역(월별 수입·지출 막대는 잔액 추이와 중복이라 제거, 사용자 결정). 폼 일괄: 삭제는 푸터 좌측 subtle danger · 페이지 모드 Card 없음 · 통장 유형 세그먼트 · 매매 2열 + 정산 요약 + accent 기록 버튼. /account 목록은 /wealth 리다이렉트(사용자 결정)."}],
          "launch": {"view": "canvas"}}
(OUT / "canvas.json").write_text(json.dumps(canvas, ensure_ascii=False, indent=2), encoding="utf-8")
print("ok", len(FILES))
