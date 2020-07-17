package com.google.step.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.gson.Gson;
import javax.servlet.http.HttpServletRequest;

/** Class contains the common used helper method for servlets.*/
public final class ServletHelper {

  /* The static store service that can be used to all servlets */
  protected final static DatastoreService DEFAULT_DATASTORE_SERVICE = 
                                DatastoreServiceFactory.getDatastoreService();
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

  /** Disables the default constructor */
  private ServletHelper() {}
}