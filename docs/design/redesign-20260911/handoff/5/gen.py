# -*- coding: utf-8 -*-
"""배치5 handoff 생성기 — 가설 A+C 확장. 배치4 gen.py 의 CSS·헬퍼를 재사용(exec, FILES 정의 전까지만).
화면: 고정지출 시트(추가·수정 — 금액 A 제거 / B 백엔드 금액) · 고정지출 목록 보관 섹션 · 가계부 목록(A 소유자만 수정 / B 탭 = 전환)
· 가계부 시트(통화 A 제거 / B 읽기 전용) · 상태 · 데스크톱 3.
실행: python3 gen.py → *.dc.html + canvas.json  (번들은 S5 참조용, 코드에 붙이지 않는다)
"""
import json, pathlib
OUT5 = pathlib.Path(__file__).parent
_src4 = (OUT5.parent / "4" / "gen.py").read_text(encoding="utf-8")
exec(_src4[: _src4.index("FILES = {")])
OUT = OUT5

CSS = CSS + """
.field .input .dot6{width:6px;height:6px;border-radius:3px;display:inline-block;margin-right:8px;vertical-align:middle}
.field .input.sel{justify-content:space-between}
.field .input.area{height:64px;align-items:flex-start;padding-top:12px}
.fdesc{font-size:12px;color:var(--dim);margin-top:4px;padding-bottom:4px}
.swr{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 0}
.swr .k b{display:block;font-size:13px;font-weight:500;color:var(--dim)}
.swr .k span{display:block;font-size:12px;color:var(--dim);margin-top:2px}
.tg{width:40px;height:24px;border-radius:12px;background:var(--surface2);border:1px solid var(--hair);position:relative;flex-shrink:0}
.tg::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:8px;background:var(--dim)}
.tg.on{background:var(--accent);border-color:var(--accent)}
.tg.on::after{left:19px;background:var(--surface)}
.r .t.dimt{color:var(--dim)}
.inuse{font-size:12px;color:var(--dim)}
.elink{font-size:13px;font-weight:600;color:var(--accent)}
.fdesc,.swr{flex-shrink:0}
"""

def sel_field(label, value, dot=None, dim=False, desc=None, lock=False):
    d = f'<span class="dot6" style="background:{dot}"></span>' if dot else ""
    ds = f'<div class="desc">{desc}</div>' if desc else ""
    return (f'<div class="field"><div class="fl">{label}</div><div class="input sel{" lock" if lock else ""}">'
            f'<span class="{"dim" if dim else ""}">{d}{value}</span>{CHEV_D}</div>{ds}</div>')

def area_field(label, value, dim=False):
    return f'<div class="field"><div class="fl">{label}</div><div class="input area"><span class="{"dim" if dim else ""}">{value}</span></div></div>'

def fdesc(text):
    return f'<div class="fdesc">{text}</div>'

def switch_row(label, desc, on=False):
    return f'<div class="swr"><div class="k"><b>{label}</b><span>{desc}</span></div><div class="tg{" on" if on else ""}"></div></div>'

def swatches_n(on=-1):
    return swatches(on)

# ---------- 고정지출 시트 ----------
CAT_DESC = "고르면 목록에 카테고리가 함께 보여요"
CI_DESC = "비우면 카테고리 색·아이콘을 써요"
fx_form_new = (text_field("이름", "예) 월세", dim=True)
               + sel_field("카테고리", "선택 안 함", dim=True, desc=CAT_DESC)
               + num("결제일", '<span class="dim">1</span>', unit="일")
               + swatches_n(-1) + fdesc(CI_DESC) + icons(-1) + foot("추가"))
fx_form_edit = (text_field("이름", "넷플릭스")
                + sel_field("카테고리", "구독", dot="#0046FF", desc=CAT_DESC)
                + num("결제일", "18", unit="일")
                + swatches_n(-1) + fdesc(CI_DESC) + icons(14)
                + switch_row("보관", "거래 기록할 때 선택지에서 빠져요. 지난 기록은 그대로예요")
                + foot("저장", delete=True))
fx_form_amount = (text_field("이름", "넷플릭스")
                  + sel_field("카테고리", "구독", dot="#0046FF")
                  + num("금액", "17,000", desc="매달 나가는 금액 — 목록에 \"예정\"으로 보여요")
                  + num("결제일", "18", unit="일")
                  + swatches_n(-1) + icons(14) + foot("저장", delete=True))
FX_BEHIND = hdr_home() + sub_hdr("고정지출", "추가") + MONTH

# ---------- 고정지출 목록 — 보관 섹션 ----------
ACTIVE = FIXED[:5]
def fx_rows_used(items, archived=False):
    out = []
    for n, i, c, day, cat, used, _amt in items:
        meta = f"매월 {day}일" + (f" · {cat}" if cat else "")
        r = irow(n, i, c, meta=meta, v=(None if archived else used), vcls=("dim" if used == "0" else ""), chev=True, tall=True)
        out.append(r.replace('<div class="t"', '<div class="t dimt"', 1) if archived else r)
    return "".join(out)
FX_HERO5 = ('<div class="hero compact"><div class="lbl">9월 고정지출</div><div class="n28">792,000<span class="won">원</span></div>'
            '<div class="hint2">기록 <span class="mono">4</span>개 · 미기록 <span class="mono">1</span>개</div></div>')
fixed_arch = "\n".join([hdr_home(), sub_hdr("고정지출", "추가"), MONTH, FX_HERO5, '<div class="hr"></div>',
                        sec(f'고정지출 <span class="mono dim" style="font-weight:600">{len(ACTIVE)}</span>', ""), fx_rows_used(ACTIVE),
                        '<div class="hr"></div>', sec('보관 <span class="mono dim" style="font-weight:600">1</span>', ""),
                        fx_rows_used([("실손보험", 8, "#8B95A1", 27, None, "0", "")], archived=True)])

# ---------- 가계부 목록 ----------
HH = [("우리 가족", "소유자 · 2026.01.01 시작", True, True), ("내 투자", "소유자 · 2025.06.01 시작", False, True),
      ("부모님 가계부", "멤버 · 2024.03.01 시작", False, False)]
def hh_rows(mode="a"):
    out = []
    for n, meta, inuse, owner in HH:
        if mode == "a":
            out.append(irow(n, meta=meta, v=('<span class="inuse">사용 중</span>' if inuse else None), chev=owner, tall=True))
        else:
            v = '<span class="inuse">사용 중</span>' if inuse else ('<span class="elink">수정</span>' if owner else None)
            if inuse and owner:
                v = '<span class="inuse">사용 중</span>&nbsp;&nbsp;<span class="elink">수정</span>'
            out.append(irow(n, meta=meta, v=v, chev=False, tall=True))
    return "".join(out)
hh_sec = sec(f'가계부 <span class="mono dim" style="font-weight:600">{len(HH)}</span>', "")
hh_a = "\n".join([hdr_home(), sub_hdr("가계부", "추가"), '<div style="height:8px"></div>', hh_sec, hh_rows("a")])
hh_b = "\n".join([hdr_home(), sub_hdr("가계부", "추가"), '<div style="height:8px"></div>', hh_sec, hh_rows("b"),
                  '<div class="guide">행을 누르면 그 가계부로 바뀌어요</div>'])

# ---------- 가계부 시트 ----------
hh_form_new = (text_field("이름", "예) 우리 가족", dim=True) + area_field("설명", "선택 — 누구와 무엇을 모으는지", dim=True)
               + text_field("시작일", "2026.09.13") + fdesc("기록을 시작한 날이에요 — 표시용") + foot("추가"))
hh_form_cur = (text_field("이름", "예) 우리 가족", dim=True) + area_field("설명", "선택 — 누구와 무엇을 모으는지", dim=True)
               + '<div class="field"><div class="fl">통화</div><div class="input lock"><span>KRW · 원</span></div></div>'
               + text_field("시작일", "2026.09.13") + foot("추가"))
HH_BEHIND = hdr_home() + sub_hdr("가계부", "추가") + hh_rows("a")

# ---------- 데스크톱 ----------
fx_page_d = desk(sub_hdr("고정지출 추가") + fx_form_new.replace('class="foot3"', 'class="foot3 page"'),
                 guide_rail([("결제일", "목록 정렬·표시용이에요. 날짜가 돼도 자동으로 기록되지는 않아요."),
                             ("사용액", "거래를 기록할 때 이 항목을 고르면 그 달 사용액에 더해져요."),
                             ("삭제", "지워도 이미 기록한 거래엔 고정지출 이름이 남아요.")]), "내정보")
hh_d = desk("\n".join([sub_hdr("가계부", "추가"), '<div style="height:8px"></div>', hh_sec, hh_rows("a")]),
            guide_rail([("소유자 · 멤버", "가계부 수정·삭제와 멤버 초대는 소유자만 할 수 있어요."),
                        ("전환", "쓰는 가계부는 상단 가계부 선택에서 바꿔요.")]), "내정보")
hh_page_d = desk(sub_hdr("가계부 추가") + hh_form_new.replace('class="foot3"', 'class="foot3 page"'),
                 guide_rail([("가계부", "통장·거래·카테고리를 따로 모으는 장부예요. 멤버와 함께 쓸 수 있어요."),
                             ("시작일", "기록을 시작한 날이에요. 표시용이라 계산엔 쓰지 않아요."),
                             ("삭제", "소유자만 지울 수 있고, 가계부의 모든 데이터가 함께 지워져요.")]), "내정보")

# ---------- 상태 ----------
states5 = "\n".join([hdr_home(), hdr_title("배치5 상태"),
    '<div class="statebox"><div class="h">로딩 — 가계부 목록</div>'
    '<div class="r"><div class="skel" style="width:120px;height:14px"></div><div class="skel" style="width:60px;height:14px"></div></div>'
    '<div class="r"><div class="skel" style="width:90px;height:14px"></div></div><div class="r"><div class="skel" style="width:110px;height:14px"></div></div></div>',
    '<div class="statebox"><div class="h">카테고리 0 — 고정지출 시트</div>'
    + sel_field("카테고리", "카테고리가 없어요", dim=True, lock=True) + '</div>',
    '<div class="statebox"><div class="h">카테고리 선택 열림</div>'
    + sel_field("카테고리", "구독", dot="#0046FF")
    + '<div style="border:1px solid var(--hair);border-radius:8px;padding:4px 0;margin-top:-6px">'
    + "".join(f'<div style="padding:8px 12px;font-size:14px;display:flex;align-items:center"><span class="dot6" style="width:6px;height:6px;border-radius:3px;background:{c};margin-right:8px;display:inline-block"></span>{n}</div>'
              for n, _, c in EXP_CATS[:5]) + '</div></div>',
])

FILES = {
    "Main.dc.html": sheet4("고정지출 추가", fx_form_new, FX_BEHIND),
    "FixedSheetEdit.dc.html": sheet4("고정지출 수정", fx_form_edit, FX_BEHIND),
    "FixedSheetAmount.dc.html": sheet4("고정지출 수정", fx_form_amount, FX_BEHIND),
    "FixedArchived.dc.html": phone(fixed_arch, "내정보", fab=False),
    "Household.dc.html": phone(hh_a, "내정보", fab=False),
    "HouseholdSwitch.dc.html": phone(hh_b, "내정보", fab=False),
    "HouseholdSheet.dc.html": sheet4("가계부 추가", hh_form_new, HH_BEHIND),
    "HouseholdSheetCurrency.dc.html": sheet4("가계부 추가", hh_form_cur, HH_BEHIND),
    "States.dc.html": phone(states5, "내정보", fab=False),
    "FixedPageDesktop.dc.html": fx_page_d,
    "HouseholdDesktop.dc.html": hh_d,
    "HouseholdPageDesktop.dc.html": hh_page_d,
}
for name, html in FILES.items():
    (OUT / name).write_text(html, encoding="utf-8")

W, H, DW, DH, GX, GY = 390, 844, 1440, 900, 110, 160
mob = ["Main.dc.html", "FixedSheetEdit.dc.html", "FixedSheetAmount.dc.html", "FixedArchived.dc.html", "Household.dc.html",
       "HouseholdSwitch.dc.html", "HouseholdSheet.dc.html", "HouseholdSheetCurrency.dc.html", "States.dc.html"]
titles = {"Main.dc.html": "fixed/new · 시트 — 금액 A 제거(추천)", "FixedSheetEdit.dc.html": "fixed/[id] · 시트 — 보관 · 삭제 좌측",
          "FixedSheetAmount.dc.html": "금액 B — 백엔드 금액 추가(마이그레이션)", "FixedArchived.dc.html": "fixed · 보관 섹션",
          "Household.dc.html": "household · A 소유자만 수정(추천)", "HouseholdSwitch.dc.html": "household · B 탭 = 전환",
          "HouseholdSheet.dc.html": "household/new · 시트 — 통화 A 제거(추천)", "HouseholdSheetCurrency.dc.html": "통화 B — 읽기 전용",
          "States.dc.html": "상태"}
desks = ["FixedPageDesktop.dc.html", "HouseholdDesktop.dc.html", "HouseholdPageDesktop.dc.html"]
dtitles = {"FixedPageDesktop.dc.html": "fixed/new 페이지 모드 · 1440(좌 폼 · 우 도움말)", "HouseholdDesktop.dc.html": "household · 1440",
           "HouseholdPageDesktop.dc.html": "household/new 페이지 모드 · 1440"}
canvas = {"artboards": [{"file": f, "x": i * (W + GX), "y": 0, "w": W, "h": H, "title": titles[f]} for i, f in enumerate(mob)]
          + [{"file": f, "x": i * (DW + GX), "y": H + GY, "w": DW, "h": DH, "title": dtitles[f]} for i, f in enumerate(desks)],
          "annotations": [{"id": "pick5", "x": 0, "y": -220, "w": 700, "text": "배치5 handoff — 가설 A+C 확장(새 룩 없음). 고정지출 폼(카테고리 연결 · 결제일 \"일\" · 보관) + 가계부 목록·폼. 백엔드 스키마 대조: 고정지출엔 금액이 없고(폼 금액 = 저장 안 되는 칸), 가계부 응답엔 멤버 수가 없으며 수정·삭제는 소유자만. 고를 것 세 가지: ① 고정지출 금액 A 제거(추천) / B 백엔드 금액 추가(마이그레이션) ② 가계부 통화 A 제거(추천) / B 읽기 전용 ③ 가계부 목록 A 소유자 행만 수정(추천) / B 행 탭 = 전환. 폼 페이지는 배치4 격자(좌 폼 · 우 도움말)."}],
          "launch": {"view": "canvas"}}
(OUT / "canvas.json").write_text(json.dumps(canvas, ensure_ascii=False, indent=2), encoding="utf-8")
print("ok", len(FILES))
