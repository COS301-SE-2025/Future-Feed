/* right hand side of the notificatrions [age*/
import React from "react";

import WhatsHappening from "./WhatsHappening";
import WhoToFollow from "./WhoToFollow";
const NotificationsRight = () => {
  return (
     <div className="notifications-right">
      <WhatsHappening />
      <WhoToFollow />
    </div>
  );
};

export default NotificationsRight;