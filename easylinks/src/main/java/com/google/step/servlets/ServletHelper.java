package com.google.step.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.gson.Gson;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

/** Class contains the common used helper method for servlets.*/
public final class ServletHelper {

  /* The static store service that can be used to all servlets */
  protected final static DatastoreService DEFAULT_DATASTORE_SERVICE = 
                                DatastoreServiceFactory.getDatastoreService();
  protected final static UserService USERSERVICE = 
                                UserServiceFactory.getUserService();
  protected final static Gson GSON = new Gson();

  /** 
   * @return the request parameter, or the default value if the parameter
   *         was not specified by the client
   */
  protected static String getParameterWithDefault(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if (value == null || value.isEmpty()) {
      return defaultValue;
    }
    return value;
  }

  /**
   * Converts an List instance into the JSON format
   */
  protected static final <T> String convertToJson(List<T> messages) {
    return GSON.toJson(messages);
  }

  /** Disables the default constructor */
  private ServletHelper() {}
}