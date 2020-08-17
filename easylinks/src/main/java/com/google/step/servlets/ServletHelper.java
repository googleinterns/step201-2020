package com.google.step.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
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
  protected final static String ADMIN = "";

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
   * @return the request parameter in Integer, or the default value if the parameter
   *         was not specified by the client
   */
  protected static int getParameterWithDefault(HttpServletRequest request, String name, int defaultValue) {
    String value = request.getParameter(name);

    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException e) {
      // String doesn't contain a parsable integer
      return defaultValue;
    }
  }


  /**
   * Converts an List instance into the JSON format
   */
  protected static final <T> String convertToJson(List<T> messages) {
    return GSON.toJson(messages);
  }

  /**
   * Fetches the url that matches the shortcut and the email
   * @return the URL if the shortcut and email are found in the DataStore
   *         the defaultValue otherwise
   */
  protected static String fetchUrlWithDefault(String shortcut, String email, String defaultValue) {
    // Create the filter and search for the matched entity
    Query query = new Query("Link").setFilter(
                    CompositeFilterOperator.and(
                        new FilterPredicate("email", FilterOperator.EQUAL, email),
                        new FilterPredicate("shortcut", FilterOperator.EQUAL, shortcut)));
    Entity easyLinkEntity = DEFAULT_DATASTORE_SERVICE.prepare(query).asSingleEntity();

    if (easyLinkEntity == null) {
      return defaultValue;
    }
    return (String) easyLinkEntity.getProperty("url");
  }

  /** Disables the default constructor */
  private ServletHelper() {}
}