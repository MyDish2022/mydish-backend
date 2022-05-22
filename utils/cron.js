const OrderService = require("../services/OrderService");
const { CronJob } = require("cron");
module.exports = function initializeCron() {
    getOrderList();
}
module.exports = function getOrderList() {
    const orderJob = new CronJob(
        '* * * * *',
        async () => {
            try {
                new OrderService().orderList();
                console.log("orders are returned");
            } catch (error) {
                console.log(error)
            }
        }
    )
    orderJob.start()
}