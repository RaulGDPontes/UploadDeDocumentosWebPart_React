export class iniciarTimer {

    private static timer: number;
    public static start() {
        console.log("inicou o timer");
        this.timer = setTimeout(() => {
            alert("Parece que este processo está demorando mais que o normal.\nPor favor, recarregue a pagina e tente novamente");
        }, 15000);
    }

    public static stop() {
        clearInterval(this.timer);
    }
}
