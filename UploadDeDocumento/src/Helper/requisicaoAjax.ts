export default function getAjax(url: string) {
    return new Promise((resolve, reject) => {

        fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if (res.status >= 200 && res.status < 300) {
                return res.json();
            }
            else {
                throw new Error("erro na busca. Verifique nome das listas");
            }
        }).then((result) => {
            if (result.value) {
                resolve(result.value);
            }
        }).catch(e => {

            reject(e);
        });
    });
}
