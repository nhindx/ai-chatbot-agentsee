export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({"token":"a851a78f20a6b6559b12e6a455c665b5"});
}
