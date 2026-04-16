async function testApi() {
  try {
    const resA = await fetch("https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0", {
        headers: {
            "cookie": "L=english%2Chindi; DL=english;" // use lowercase cookie!
        }
    });
    const jsonA = await resA.json();
    console.log("English AND Hindi via lowercase cookie:", jsonA?.top_playlists?.slice(0, 3).map(p=>p.title).join(", "));
  } catch (e) {
    console.error(e);
  }
}
testApi();
