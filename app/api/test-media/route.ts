import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://media.sssinstagram.com/get?__sig=zKezymyshEUIu953j5bjjA&__expires=1788783314&uri=https%3A%2F%2Fscontent-iad3-1.cdninstagram.com%2Fo1%2Fv%2Ft2%2Ff2%2Fm86%2FAQPO6S3iZnjki1bPh5nIDl4PxTiNQ6FFC8pGxmBdyHywlks4xgSAzZKlvJ-nAaPFpT3NL7hxm7HXUhtu8c8cX3r6wDxkta9ct4O0MsU.mp4%3F_nc_cat%3D110%26_nc_sid%3D5e9851%26_nc_ht%3Dscontent-iad3-1.cdninstagram.com%26_nc_ohc%3DRHg743xg0xIQ7kNvwHJxElQ%26efg%3DeyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuMTI4MC5kYXNoX2Jhc2VsaW5lXzFfdjEiLCJ4cHZfYXNzZXRfaWQiOjk2NDg0ODgxOTg4OTcxMiwiYXNzZXRfYWdlX2RheXMiOjg1LCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6MzIsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%253D%253D%26ccb%3D17-1%26vs%3Dd6836ef516ed82fb%26_nc_vs%3DHBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC81QjQyNDYwQTQ2QkVDODBGQzE1MzQxMENCMUQxNDE4NF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzQ0NDY1NzkxQkZDMzA0NEUwNDhFOTRFMDdGNDM2RUE2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbgmN_yy-G2AxUCKAJDMywXQEAqn752yLQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA%26_nc_gid%3DYMZCwB_V7dwxjtJh5yO-5Q%26_nc_ss%3D7f39b%26_nc_zt%3D28%26oh%3D00_AQLzd2VBmBUJkJG8N6C1dK5oDLxCQuzKXdTZgOq--SUyIA%26oe%3D6AA099A7%26dl%3D1&filename=Dating%20Mejiro%20Mcqueen%2C%20wait%20for%20it%20😆motion%20by%20リリーＰ%20様%23umamusume%20%23umamusumeprettyderby.mp4&ua=-&referer=https%3A%2F%2Fwww.instagram.com%2F";

  try {
    const start = Date.now();

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
      },
    });

    const contentType = res.headers.get("content-type");

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      contentType,
      finalUrl: res.url,
      elapsedMs: Date.now() - start,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
