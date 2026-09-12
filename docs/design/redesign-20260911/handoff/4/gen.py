# -*- coding: utf-8 -*-
"""배치4 handoff 생성기 — 가설 A+C 확장. 배치3 gen.py 의 CSS·헬퍼를 재사용(exec, 통장 화면 정의 전까지만).
화면: category(A 섹션+아이콘 글리프 / B 칩+점) · 카테고리 시트(추가·수정) · fixed · 상태 · 데스크톱 2.
실행: python3 gen.py → *.dc.html + canvas.json  (번들은 S5 참조용, 코드에 붙이지 않는다)
"""
import json, pathlib
OUT4 = pathlib.Path(__file__).parent
_src3 = (OUT4.parent / "3" / "gen.py").read_text(encoding="utf-8")
__file__ = str(OUT4.parent / "3" / "gen.py")  # 배치3 이 배치2 경로를 __file__ 기준으로 찾는다
exec(_src3[: _src3.index("# ---------- account/[accountId]")])
OUT = OUT4

CSS = CSS + """
.field .seg span{height:38px;line-height:38px}
.gl{width:18px;height:18px;display:flex;flex-shrink:0}
.gl svg{width:18px;height:18px}
.r .lg{display:flex;align-items:center;gap:12px;min-width:0}
.hint2{font-size:13px;color:var(--dim)}
.hint2 .mono{color:var(--text);font-weight:600}
.guide{font-size:12px;color:var(--dim);line-height:1.6;padding:8px 0 4px}
.chev2{color:var(--dim);display:flex}
.r,.sec,.month,.hero,.chips,.guide{flex-shrink:0}
.gd{padding:10px 0;border-bottom:1px solid var(--hair2)}
.gd:last-child{border-bottom:0}
.gd b{display:block;font-size:13px;font-weight:700;margin-bottom:4px}
.gd span{display:block;font-size:12px;color:var(--dim);line-height:1.6}
"""

def glyph(i, color):
    return f'<span class="gl" style="color:{color}">{SVG}{ICON_PATHS[i]}</svg></span>'

def irow(title, icon=None, color=None, meta=None, v=None, vcls="", sub=None, chev=True, dot=None, tall=False):
    lead = glyph(icon, color) if icon is not None else ""
    d = f'<span class="dot" style="background:{dot}"></span>' if dot else ""
    m = f'<div class="m">{meta}</div>' if meta else ""
    right = (f'<div class="v {vcls}">{v}</div>' if v is not None else "") + (f'<div class="sub">{sub}</div>' if sub else "")
    rt = f'<div class="rt">{right}</div>' if right else ""
    ch = f'<span class="chev2">{CHEV_R}</span>' if chev else ""
    return (f'<div class="r{" tall" if tall else ""}"><div class="lg">{lead}<div class="l"><div class="t" style="display:flex;gap:6px;align-items:center">{d}{title}</div>{m}</div></div>'
            f'<div class="rt row" style="flex-direction:row;align-items:center;gap:8px">{rt}{ch}</div></div>')

# ---------- 데이터 (예시) ----------
EXP_CATS = [("식비", 7, "#EF4444"), ("카페·간식", 4, "#D97706"), ("외식", 4, "#FF6B6B"), ("교통", 5, "#3B82F6"),
            ("쇼핑", 7, "#8B5CF6"), ("주거·통신", 1, "#2F855A"), ("구독", 14, "#0046FF"), ("의료", 8, "#4ECDC4")]
INC_CATS = [("급여", 3, "#2F855A"), ("부수입", 9, "#FCD34D"), ("이자·배당", 10, "#95E1D3")]
FIXED = [("월세", 1, "#2F855A", 25, "주거·통신", "650,000", "650,000"), ("통신비", 13, "#3B82F6", 20, "주거·통신", "55,000", "55,000"),
         ("넷플릭스", 14, "#0046FF", 18, "구독", "17,000", "17,000"), ("헬스장", 8, "#4ECDC4", 5, "의료", "70,000", "70,000"),
         ("유튜브 프리미엄", 14, "#0046FF", 28, "구독", "0", "14,900"), ("실손보험", 8, "#8B95A1", 27, None, "0", "120,000")]

# ---------- category A — 섹션 그룹 + 아이콘 글리프 ----------
def cat_rows_a(cats):
    return "".join(irow(n, i, c) for n, i, c in cats)
cat_a_list = (sec(f'지출 <span class="mono dim" style="font-weight:600">{len(EXP_CATS)}</span>', "") + cat_rows_a(EXP_CATS)
              + '<div class="hr"></div>' + sec(f'수입 <span class="mono dim" style="font-weight:600">{len(INC_CATS)}</span>', "") + cat_rows_a(INC_CATS))
cat_a = "\n".join([hdr_home(), sub_hdr("카테고리", "추가"), '<div style="height:8px"></div>', cat_a_list])

# ---------- category B — 칩 필터 + 점 ----------
cat_b = "\n".join([hdr_home(), sub_hdr("카테고리", "추가"),
                   '<div class="chips"><span class="on">전체</span><span>지출</span><span>수입</span></div>',
                   '<div style="height:6px"></div>',
                   "".join(irow(n, dot=c, meta=("지출" if k == "e" else "수입"))
                           for k, (n, _, c) in [("e", x) for x in EXP_CATS[:6]] + [("i", x) for x in INC_CATS[:2]])])

# ---------- 카테고리 시트 ----------
def sort_field(value, dim=False):
    return (f'<div class="field"><div class="fl">정렬</div><div class="input num"><span class="{"dim" if dim else ""}">{value}</span></div>'
            '<div class="desc">작을수록 위에 보여요</div></div>')
cat_form_new = (seg_field("분류", ["지출", "수입"], 0) + text_field("이름", "예) 식비", dim=True)
                + swatches(2) + icons(7) + sort_field("0", dim=True) + foot("추가"))
cat_form_edit = (seg_field("분류", ["지출", "수입"], 0) + text_field("이름", "카페·간식")
                 + swatches(5) + icons(4) + sort_field("2") + foot("저장", delete=True))
def sheet4(title, body, behind):
    return wrap('<div class="phone"><div class="body">' + behind + '</div>'
                + f'<div class="scrim"></div><div class="sheet"><div class="handle"></div><div class="st">{title}</div>{body}</div>' + tab("내정보") + '</div>')
BEHIND = hdr_home() + sub_hdr("카테고리", "추가") + cat_rows_a(EXP_CATS[:4])

# ---------- fixed ----------
MONTH = f'<div class="month"><span class="arr">{ARR_L}</span>2026.09<span class="arr">{ARR_R}</span></div>'
FX_HERO = ('<div class="hero compact"><div class="lbl">9월 고정지출</div><div class="n28">792,000<span class="won">원</span></div>'
           '<div class="hint2">예정 <span class="mono">926,900</span> · 미기록 2개</div></div>')
def fx_rows(mode="a"):
    out = []
    for n, i, c, day, cat, used, amt in FIXED:
        meta = f"매월 {day}일" + (f" · {cat}" if cat else "")
        out.append(irow(n, i if mode == "a" else None, c, meta=meta, v=used, vcls=("dim" if used == "0" else ""),
                        sub=f"예정 {amt}", chev=False, dot=(None if mode == "a" else c), tall=True))
    return "".join(out)
fx_list = sec(f'고정지출 <span class="mono dim" style="font-weight:600">{len(FIXED)}</span>', "") + fx_rows("a")
fixed_m = "\n".join([hdr_home(), sub_hdr("고정지출", "추가"), MONTH, FX_HERO, '<div class="hr"></div>', fx_list])

# ---------- 데스크톱 ----------
cat_d_col = "\n".join([sub_hdr("카테고리", "추가"), '<div style="height:8px"></div>', cat_a_list])
cat_d_rail = "\n".join(['<div class="hr"></div>', sec("안내", ""),
                        '<div class="guide">거래나 고정지출이 연결된 카테고리는 삭제할 수 없어요. 먼저 옮기거나 지워 주세요.</div>'])
FX_HERO_D = FX_HERO.replace('<div class="hint2">예정 <span class="mono">926,900</span> · 미기록 2개</div>', '')
fx_d_col = "\n".join([sub_hdr("고정지출", "추가"), MONTH, FX_HERO_D, '<div class="hr"></div>', fx_list])
fx_d_rail = "\n".join(['<div class="hr"></div>', sec("9월", ""), irow("예정 합계", v="926,900", chev=False),
                       irow("사용 합계", v="792,000", chev=False), irow("미기록", v="2개", vcls="dim", chev=False)])

# ---------- 폼 페이지 모드(fallback 라우트) — 앱 격자 그대로: 좌 720 폼 · 우 320 도움말 ----------
def guide_rail(items):
    return '<div class="hr"></div>' + sec("도움말", "") + "".join(f'<div class="gd"><b>{t}</b><span>{b}</span></div>' for t, b in items)
cat_page_d = desk(sub_hdr("카테고리 추가") + cat_form_new.replace('class="foot3"', 'class="foot3 page"'),
                  guide_rail([("분류", "지출 · 수입 중 하나. 거래를 기록할 때 이 분류의 카테고리만 보여요."),
                              ("정렬", "숫자가 작을수록 목록 위에 보여요. 같으면 추가한 순서."),
                              ("삭제", "거래나 고정지출이 연결된 카테고리는 삭제할 수 없어요.")]), "내정보")
acc_form_page = (text_field("이름", "예: 국민 급여통장", dim=True) + seg_field("유형", ["생활", "적립", "투자"], 0)
                 + num("시작 잔액", '<span class="dim">0</span>') + swatches(0) + icons(0) + foot("추가", page=True))
acc_page_d = desk(sub_hdr("통장 추가") + acc_form_page,
                  guide_rail([("유형", "생활 = 매일 쓰는 입출금 · 적립 = 예적금·비상금 · 투자 = 증권 계좌(종목은 투자 탭에서)."),
                              ("시작 잔액", "기록을 시작하는 날의 잔액이에요. 이후 잔액은 거래로 계산돼요."),
                              ("삭제", "거래나 종목이 있는 통장은 삭제할 수 없어요.")]), "홈")

# ---------- 상태 ----------
states = "\n".join([hdr_home(), hdr_title("배치4 상태"),
    '<div class="statebox"><div class="h">빈 — 카테고리 0</div>' + sub_hdr("카테고리", "추가") + '<div class="empty">카테고리가 없어요 <a>추가</a></div></div>',
    '<div class="statebox"><div class="h">빈 — 고정지출 0</div>' + sub_hdr("고정지출", "추가") + MONTH
    + '<div class="empty" style="flex-direction:column;gap:4px">고정지출이 없어요<span>월세·구독처럼 매달 나가는 돈을 등록해요 <a>추가</a></span></div></div>',
    '<div class="statebox"><div class="h">로딩 — 월 요약 · 행</div><div class="skel" style="width:80px;height:13px"></div><div class="skel" style="width:160px;height:28px;margin-top:8px"></div>'
    '<div class="r"><div class="skel" style="width:120px;height:14px"></div><div class="skel" style="width:80px;height:14px"></div></div>'
    '<div class="r"><div class="skel" style="width:90px;height:14px"></div><div class="skel" style="width:96px;height:14px"></div></div></div>',
    '<div class="statebox"><div class="h">에러 — 월 요약만 인라인</div>' + MONTH + '<div class="empty">이번 달 합계를 불러오지 못했어요 <a>다시 시도</a></div>'
    + irow("월세", 1, "#2F855A", meta="매월 25일 · 주거·통신", v="—", vcls="dim", sub="예정 650,000", chev=False) + '</div>',
])

FILES = {
    "Main.dc.html": phone(cat_a, "내정보", fab=False),
    "CategoryChips.dc.html": phone(cat_b, "내정보", fab=False),
    "CategorySheet.dc.html": sheet4("카테고리 추가", cat_form_new, BEHIND),
    "CategorySheetEdit.dc.html": sheet4("카테고리 수정", cat_form_edit, BEHIND),
    "Fixed.dc.html": phone(fixed_m, "내정보", fab=False),
    "States.dc.html": phone(states, "내정보", fab=False).replace('<div class="phone">', '<div class="phone" style="height:1080px">', 1),
    "CategoryDesktop.dc.html": desk(cat_d_col, cat_d_rail, "내정보"),
    "FixedDesktop.dc.html": desk(fx_d_col, fx_d_rail, "내정보"),
    "CategoryPageDesktop.dc.html": cat_page_d,
    "AccountPageDesktop.dc.html": acc_page_d,
}
for name, html in FILES.items():
    (OUT / name).write_text(html, encoding="utf-8")

W, H, DW, DH, GX, GY = 390, 844, 1440, 900, 110, 160
mob = ["Main.dc.html", "CategoryChips.dc.html", "CategorySheet.dc.html", "CategorySheetEdit.dc.html", "Fixed.dc.html", "States.dc.html"]
titles = {"Main.dc.html": "category · A 섹션 + 아이콘(추천)", "CategoryChips.dc.html": "category · B 칩 필터 + 점",
          "CategorySheet.dc.html": "category/new · 시트", "CategorySheetEdit.dc.html": "category/[id] · 시트(삭제 좌측)",
          "Fixed.dc.html": "fixed · 390", "States.dc.html": "상태"}
desks = ["CategoryDesktop.dc.html", "FixedDesktop.dc.html", "CategoryPageDesktop.dc.html", "AccountPageDesktop.dc.html"]
dtitles = {"CategoryDesktop.dc.html": "category · 1440", "FixedDesktop.dc.html": "fixed · 1440", "CategoryPageDesktop.dc.html": "category/new 페이지 모드 · 1440(좌 폼 · 우 도움말)", "AccountPageDesktop.dc.html": "account/new 페이지 모드 · 1440(배치3 가운데 정렬 대체)"}
canvas = {"artboards": [{"file": f, "x": i * (W + GX), "y": 0, "w": W, "h": 1080 if f == "States.dc.html" else H, "title": titles[f]} for i, f in enumerate(mob)]
          + [{"file": f, "x": (i % 2) * (DW + GX), "y": 1080 + GY + (i // 2) * (DH + GY), "w": DW, "h": DH, "title": dtitles[f]} for i, f in enumerate(desks)],
          "annotations": [{"id": "pick4", "x": 0, "y": -200, "w": 620, "text": "배치4 handoff — 가설 A+C 확장. 관리 화면 2개(카테고리 · 고정지출) + 카테고리 시트. 카드·아이콘 박스·분류 배지 제거, 헤더는 SubHeader + 추가. 고를 것: 카테고리 목록 A(지출·수입 섹션 + 18px 아이콘, 추천) vs B(칩 필터 + 색 점). 고정지출 = 이번 달 사용 합계 hero + 행마다 예정 금액. 관리 화면에서 내정보 탭 활성. 폼 페이지 모드(fallback)는 앱 격자 그대로 좌 폼 · 우 도움말(배치3 가운데 정렬을 대체, 사용자 피드백). pick = A."}],
          "launch": {"view": "canvas"}}
(OUT / "canvas.json").write_text(json.dumps(canvas, ensure_ascii=False, indent=2), encoding="utf-8")
print("ok", len(FILES))
