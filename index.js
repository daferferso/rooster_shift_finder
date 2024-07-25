async function assign() {
  const res = await fetch(
    "https://bo.usehurrier.com/api/rooster/v2/unassigned_shifts/9479389/assign",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "es-419,es;q=0.7",
        authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleW1ha2VyLXJpZGVyLTAwMTItaWFtIiwidHlwIjoiSldUIn0.eyJpc3MiOiJsb2dpc3RpY3Mtand0LWlzc3VlciIsInN1YiI6MjE4NzksImF1ZCI6ImlhbS1sb2dpbi11cyIsImV4cCI6MTcyMTYxOTQ0MiwiaWF0IjoxNzIxNjA1MDQyLCJqdGkiOiI0aDA0OWR3bmk4YWZnbmtsejZ6aXozZmNpN3Q2aXlmdjVkenZueHN0Iiwic2NvcGUiOiJrZXltYWtlci51c2VyLmlhbS1sb2dpbi11cy5wYXNzd29yZCIsImVtYSI6InlhbWlsZWxwZW9yMTlAZ21haWwuY29tIiwidXNlcm5hbWUiOiIyMTg3OSIsIm5hbSI6IkpoYXNvbm4gamFtaWwgbW9udGVjaW5vcyB2aWxsYSIsInJvbCI6ImRyaXZlciIsInJvbGVzIjpbInJvb3N0ZXIuY291cmllciIsIm1vYmlsZS5jb3VyaWVyIiwicGF5bWVudHMuY291cmllciIsImNvZC5jb3VyaWVyIl0sImNvdW50cmllcyI6WyJibyJdfQ.JN50qhrpgcAOU-2E4_W2Pa3MuqQbQAAO-fKBxl1TN16rmoBWlQrcWrrmacl-lLEV37N_r0fJjbXSC_yibA-iQpWOghgD1-S1-yEp3Meacf2DQ9ODgnUgQdq1_yM7RkFvphpkSSayzaSRKpFXTEfPxxHhutGE1kII6ncG4plp8gR4IcNJTWC4OuU8acf1DOfAp0L1vJ3T6Fi-GvYcENzgOM9sgx4SZZi984RtMq55qSwz_Yo0G2eKE6Lq84LbWFx5rTlHl44PwQtnXTF6lxv6MBixisL5tfG0hk6wAuDcVEJwldVu4ncI5RdyxIbxfUb2GBQyMEMw5DCSlHRCUXMW1g",
        baggage:
          "sentry-environment=production,sentry-release=v2.80.65-release,sentry-public_key=5d73e111d3ad632483e46db8a042941e,sentry-trace_id=78b22670352345019ade4a1852bff538",
        "client-version": "v2.80.65-release",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "sentry-trace": "78b22670352345019ade4a1852bff538-acba32b8f64b4af2",
        cookie:
          "_cfuvid=uMQchCOJSTI5Lmkkcb79pY7eG.664pQ3bQcIwz.QBc8-1721578968972-0.0.1.1-604800000; __cf_bm=zU7Csw7kGw4dDlQvKN1QJRjuveRPsUDRlsvgs0DBggI-1721606498-1.0.1.1-oL.JKe_sdvyKKuopA3uFMgcv8xiuZrt_Ap1JUbbBTFuS1p.S3FjgTY2YFngq5gtQ773ZJdATHkFWamHFKSSOHA",
        Referer: "https://bo.usehurrier.com/app/rooster/web/shifts",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: '{"id":9479389,"start_at":"2024-07-28T23:00:00.000Z","end_at":"2024-07-29T05:00:00.000Z","starting_point_id":14,"employee_ids":[21879]}',
      method: "POST",
    }
  );
  const res2 = await fetch(
    "https://bo.usehurrier.com/api/rooster/v2/unassigned_shifts/9477118/assign",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "es-419,es;q=0.7",
        authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleW1ha2VyLXJpZGVyLTAwMTItaWFtIiwidHlwIjoiSldUIn0.eyJpc3MiOiJsb2dpc3RpY3Mtand0LWlzc3VlciIsInN1YiI6MjE4NzksImF1ZCI6ImlhbS1sb2dpbi11cyIsImV4cCI6MTcyMTYxOTQ0MiwiaWF0IjoxNzIxNjA1MDQyLCJqdGkiOiI0aDA0OWR3bmk4YWZnbmtsejZ6aXozZmNpN3Q2aXlmdjVkenZueHN0Iiwic2NvcGUiOiJrZXltYWtlci51c2VyLmlhbS1sb2dpbi11cy5wYXNzd29yZCIsImVtYSI6InlhbWlsZWxwZW9yMTlAZ21haWwuY29tIiwidXNlcm5hbWUiOiIyMTg3OSIsIm5hbSI6IkpoYXNvbm4gamFtaWwgbW9udGVjaW5vcyB2aWxsYSIsInJvbCI6ImRyaXZlciIsInJvbGVzIjpbInJvb3N0ZXIuY291cmllciIsIm1vYmlsZS5jb3VyaWVyIiwicGF5bWVudHMuY291cmllciIsImNvZC5jb3VyaWVyIl0sImNvdW50cmllcyI6WyJibyJdfQ.JN50qhrpgcAOU-2E4_W2Pa3MuqQbQAAO-fKBxl1TN16rmoBWlQrcWrrmacl-lLEV37N_r0fJjbXSC_yibA-iQpWOghgD1-S1-yEp3Meacf2DQ9ODgnUgQdq1_yM7RkFvphpkSSayzaSRKpFXTEfPxxHhutGE1kII6ncG4plp8gR4IcNJTWC4OuU8acf1DOfAp0L1vJ3T6Fi-GvYcENzgOM9sgx4SZZi984RtMq55qSwz_Yo0G2eKE6Lq84LbWFx5rTlHl44PwQtnXTF6lxv6MBixisL5tfG0hk6wAuDcVEJwldVu4ncI5RdyxIbxfUb2GBQyMEMw5DCSlHRCUXMW1g",
        baggage:
          "sentry-environment=production,sentry-release=v2.80.65-release,sentry-public_key=5d73e111d3ad632483e46db8a042941e,sentry-trace_id=78b22670352345019ade4a1852bff538",
        "client-version": "v2.80.65-release",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "sentry-trace": "78b22670352345019ade4a1852bff538-acba32b8f64b4af2",
        cookie:
          "_cfuvid=uMQchCOJSTI5Lmkkcb79pY7eG.664pQ3bQcIwz.QBc8-1721578968972-0.0.1.1-604800000; __cf_bm=zU7Csw7kGw4dDlQvKN1QJRjuveRPsUDRlsvgs0DBggI-1721606498-1.0.1.1-oL.JKe_sdvyKKuopA3uFMgcv8xiuZrt_Ap1JUbbBTFuS1p.S3FjgTY2YFngq5gtQ773ZJdATHkFWamHFKSSOHA",
        Referer: "https://bo.usehurrier.com/app/rooster/web/shifts",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: '{"id":9477118,"start_at":"2024-07-28T16:30:00.000Z","end_at":"2024-07-28T21:00:00.000Z","starting_point_id":9,"employee_ids":[21879]}',
      method: "POST",
    }
  );
  console.log(res.status);
  console.log(res2.status);
}

assign()
