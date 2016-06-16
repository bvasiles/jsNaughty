define(["sprd/model/Design", "sprd/model/User"], function (Design, User) {
        return Design.inherit("sprd.model.ShopDesign", {
            defaults: {
                user: null
            },

            schema: {
                user: User
            }
        });
    });

